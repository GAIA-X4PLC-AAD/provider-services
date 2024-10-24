import sys, json ,os

################ parameters ########################
'''
try:
    nodeJsData = json.load(sys.stdin) # nodeJsData is <dict>   #load (NOT loads) to read from stream sys.stdin
except json.JSONDecodeError as err:
    json.dumps({'result': err})
    sys.exit(1)
'''
signal_type = "-1"#int(nodeJsData['signal_type'])
signal_subtype = "-1"#int(nodeJsData['signal_subtype']) 
signal_value = "-1"#int(nodeJsData['signal_value']) 
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
                print("found")
                signal_found = True   
                break
        if signal_found:
            log.append("matching track found in Road " + road.get("id"))
    return log

################ MAIN ########################
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #access the helpers scripts in the parent dir
import io_functions as io
import githubConnect

# read Bjson
urls = [r'D:\Code\GaiaX\map-and-scenario-data\services\extended search\python\scripts\xodr\out.json']
def search_url(url):
    bjson_name = os.path.basename(url)
    data = io.read_json_file(url,False)
    root = io.json_to_xml(data)
    print(root)
    if(root == None):
        log = ['failed to parse odr data, probably not a valid ODR file'] 
    else: 
        log = find_Roads_with_Signals_SubTypes_Value(root)
    res = {bjson_name : log}
    return res
        
logs = {}
for url in urls:
   res = search_url(url)
   logs = logs | res
  
pyData = {'result':logs} # Print the data in stringified json format so that we can easily parse it in Node.js        
stringifiedNodeJsData = json.dumps(pyData) #stringifiedNodeJsData is <str>   #dumps (NOT dump) to write out json like string to be passed to print (stdou) // serialize python object to json
print(stringifiedNodeJsData)
