"""
Notification module for sending alerts via external services like NTFY.sh.
"""
import requests
import logging
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Use a unique topic name for the project
NTFY_TOPIC = os.getenv("NTFY_TOPIC", "precognito_alerts_demo")
NTFY_URL = f"https://ntfy.sh/{NTFY_TOPIC}"

def send_external_notification(title: str, message: str, priority: str = "default", tags: list = None):
    """Sends a notification via NTFY.sh.

    Args:
        title: The title of the notification.
        message: The body text of the notification.
        priority: Priority level (min, low, default, high, urgent). 
            Defaults to "default".
        tags: A list of emoji tags or keywords for the notification.
            Defaults to None.
    """
    # Encode title to handle emojis in headers (NTFY supports UTF-8)
    # We use .encode('utf-8').decode('latin-1') trick if needed, 
    # but a cleaner way is to ensure no non-latin1 in headers if the client is strict.
    # However, ntfy supports 'X-Title' or just sending title in body.
    
    headers = {
        "Priority": priority,
    }
    
    # Use 'Title' header but handle potential encoding issues
    if title:
        try:
            # Try to see if it's latin-1 compatible
            title.encode('latin-1')
            headers["Title"] = title
        except UnicodeEncodeError:
            # If not, we'll just use the message body for the whole thing 
            # or strip emojis for the header specifically.
            import re
            clean_title = title.encode('ascii', 'ignore').decode('ascii').strip()
            headers["Title"] = clean_title
    
    if tags:
        headers["Tags"] = ",".join(tags)
        
    try:
        # We send the message as the body (data) which handles UTF-8 correctly
        response = requests.post(NTFY_URL, data=message.encode('utf-8'), headers=headers, timeout=5)
        if response.status_code == 200:
            logger.info(f"External notification sent successfully to topic: {NTFY_TOPIC}")
        else:
            logger.error(f"Failed to send NTFY notification: {response.status_code} {response.text}")
    except Exception as e:
        logger.error(f"Error sending external notification: {e}")

def notify_critical_anomaly(device_id: str, reason: str):
    """Sends a critical anomaly notification.

    Args:
        device_id: The ID of the affected device.
        reason: The reason for the anomaly.
    """
    send_external_notification(
        title=f"🚨 CRITICAL ANOMALY: {device_id}",
        message=f"Machine failure imminent! Reason: {reason}. Check dashboard immediately.",
        priority="urgent",
        tags=["warning", "skull", "factory"]
    )

def notify_safety_alert(device_id: str, temp: float):
    """Sends a safety breach notification for sustained high temperatures.

    Args:
        device_id: The ID of the affected device.
        temp: The detected temperature.
    """
    send_external_notification(
        title=f"🔥 SAFETY BREACH: {device_id}",
        message=f"Sustained high temperature detected: {temp}°C. Fire risk high!",
        priority="urgent",
        tags=["fire", "ambulance", "warning"]
    )
