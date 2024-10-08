import os, requests
from dotenv import load_dotenv

def get_github_bjson(url: str, mode: str = "private"):
    url = url.replace("/blob/", "/")
    url = url.replace("/raw/", "/")
    url = url.replace("github.com/", "raw.githubusercontent.com/")

    if mode == "public":
        return requests.get(url)
    else:
        load_dotenv()
        token = os.getenv('GITHUB_TOKEN')

        headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3.raw'}
        resp =  requests.get(url, headers=headers)
        if resp.status_code == 200:
            binary_data = resp.content  # binary JSON data
        else:
            raise ValueError(f"Failed to fetch data: {resp.status_code}")
        return binary_data