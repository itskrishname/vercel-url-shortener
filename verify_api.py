import requests
import json
import sys

def test_api():
    base_url = "http://localhost:3005"

    # Test Case 1: The user's specific URL format
    # SHORTLINK_API=https://.../api/bridge?api=TOKEN&url={url}&provider=PROVIDER

    params = {
        "api": "21aaeb55bffd061323a98157ceb6057e31cc3392", # Example token
        "url": "https://example.com",
        "provider": "https://gplinks.com/api"
    }

    print(f"Testing /api/bridge with params: {params}")
    try:
        response = requests.get(f"{base_url}/api/bridge", params=params, timeout=15)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            data = response.json()
            if "shortenedUrl" in data:
                print("SUCCESS: 'shortenedUrl' found in response.")
            else:
                print("PARTIAL SUCCESS: JSON returned but missing 'shortenedUrl'.")
        else:
            print("FAILURE: Non-200 status code.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
