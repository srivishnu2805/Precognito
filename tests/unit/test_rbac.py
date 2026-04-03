import pytest
from fastapi import HTTPException
from precognito.api import RoleChecker

def test_role_checker_allow():
    checker = RoleChecker(["ADMIN", "MANAGER"])
    user = {"role": "ADMIN"}
    
    # Should not raise
    result = checker(user)
    assert result == user

def test_role_checker_deny():
    checker = RoleChecker(["ADMIN"])
    user = {"role": "TECHNICIAN"}
    
    with pytest.raises(HTTPException) as excinfo:
        checker(user)
    
    assert excinfo.value.status_code == 403
    assert "permission" in excinfo.value.detail
