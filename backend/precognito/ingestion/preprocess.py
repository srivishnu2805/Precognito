def preprocess(data):
    return {
        "temperature": round(data["temperature"], 2),
        "vibration": round(data["vibration"], 2),
        "pressure": round(data["pressure"], 2)
    }