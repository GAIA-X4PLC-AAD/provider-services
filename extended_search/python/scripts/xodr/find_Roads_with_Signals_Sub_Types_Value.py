import sys, json ,os

################ parameters ########################

try:
    nodeJsData = json.load(sys.stdin) # nodeJsData is <dict>   #load (NOT loads) to read from stream sys.stdin
except json.JSONDecodeError as err:
    json.dumps({'result': err})
    sys.exit(1)

signal_type = nodeJsData['signal_type']
signal_subtype = nodeJsData['signal_subtype']
signal_value = nodeJsData['signal_value']
data_Urls = list(nodeJsData['dataUrls'])

################ search functions ########################
def find_Roads_with_Signals_SubTypes_Value(root):
    log = list()
    #all roads
    for road in root.findall("./road"):
        signal_found = False
        # all signals 
        for signal in road.findall("./signals/signal"):
            if (signal.get("type") == signal_type and
                signal.get("subtype") == signal_subtype and
                signal.get("value") == signal_value):
                signal_found = True   
                break
        if signal_found:
            log.append("matching track found in Road " + road.get("id"))
    return log

################ MAIN ########################
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #access the helpers scripts in the parent dir
import io_functions as io
import githubConnect
import urllib.parse 

def search_url(url):
    bjson_name = urllib.parse.unquote(os.path.basename(url)) # converts URL-encoded characters back to their original form.
    binary_data = githubConnect.get_github_bjson(url)
    data = io.read_json_binary(binary_data)
    root = io.json_to_xml(data)
    if(root == None):
        log = ['failed to parse odr data, probably not a valid ODR file'] 
    else: 
        log = find_Roads_with_Signals_SubTypes_Value(root)
    res = {bjson_name : log}
    return res
        
logs = {}
'''
with open('/app/python/scripts/xodr/urls_reduced_data.txt') as f:
    for line in f:
        res = search_url(line.strip())
        logs = logs | res
'''
for url in data_Urls:
    res = search_url(url)#.strip())
    logs = logs | res

pyData = {'result':logs} # Print the data in stringified json format so that we can easily parse it in Node.js        
stringifiedNodeJsData = json.dumps(pyData, ensure_ascii=False) #stringifiedNodeJsData is <str>   #dumps (NOT dump) to write out json like string to be passed to print (stdou) // serialize python object to json
print(stringifiedNodeJsData)
