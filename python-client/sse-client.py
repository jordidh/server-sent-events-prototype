# -*- coding: utf-8 -*-
#!/usr/bin/env python

import time
import json
import pprint
import sseclient

"""
https://pypi.org/project/sseclient-py/
https://www.programcreek.com/python/example/93555/sseclient.SSEClient

$ pip install sseclient-py 
"""


def with_urllib3(url):
    # Get a streaming response for the given event feed using urllib3.
    import urllib3
    http = urllib3.PoolManager()
    return http.request('GET', url, preload_content=False, retries=10)

def with_requests(url):
    # Get a streaming response for the given event feed using requests.
    import requests
    return requests.get(url, stream=True)

url = 'http://localhost:3000/events'

while True:
    try:
        pprint.pprint("Waiting SSE")
        response = with_urllib3(url=url)  # or with_requests(url)
        client = sseclient.SSEClient(response)
        for event in client.events():
            pprint.pprint(json.loads(event.data))
    except Exception as ex:
        pprint.pprint("Error in event loop [{0}]".format(ex))
        time.sleep(1)
        pprint.pprint("Reconnect to SSEClient")
        continue

