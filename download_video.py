import urllib.request

url = 'https://cdn.pixabay.com/video/2021/04/12/70851-537446415_large.mp4'
file_name = 'public/videos/philosophy.mp4'

req = urllib.request.Request(
    url, 
    data=None, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://pixabay.com/'
    }
)

try:
    with urllib.request.urlopen(req) as response, open(file_name, 'wb') as out_file:
        data = response.read()
        out_file.write(data)
    print("Download successful.")
except Exception as e:
    print(f"Failed to download: {e}")
