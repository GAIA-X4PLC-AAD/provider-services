import sys, json ,os

################ parameters ########################
try:
    nodeJsData = json.load(sys.stdin) # nodeJsData is <dict>   #load (NOT loads) to read from stream sys.stdin
except json.JSONDecodeError as err:
    json.dumps({'result': err})
    sys.exit(1)

connections_count = int(nodeJsData['connections_count'])
################ search functions ########################
def find_Junctions_with_connections_count(root):
    log = list()
    for junction in root.findall("./junction"):
        junction_conn_count = get_junction_unique_connectios_count(root, junction)
        if(junction_conn_count == connections_count):
            log.append("matching junction with id: " + junction.get("id") + " was found!")
    return log

def get_junction_unique_connectios_count(root , junction):
    unique_element_ids = set()
    for connection in junction.findall("./connection"):
        connecting_road = connection.get('connectingRoad')
        for road in root.findall("./road"):
            if(road.get('id') == connecting_road):          
                link_element = road.find('link')
                if link_element is not None:
                    for child in link_element:
                        element_id = child.get('elementId')
                        if element_id is not None:
                            unique_element_ids.add(element_id)
    return len(unique_element_ids)

################ MAIN ########################
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #access the helpers scripts in the parent dir
import io_functions as io
import githubConnect

def search_url(url):
    bjson_name = os.path.basename(url)
    binary_data = githubConnect.get_github_bjson(url)
    data = io.read_json_binary(binary_data)
    root = io.json_to_xml(data)
    if(root == None):
        log = ['failed to parse odr data, probably not a valid ODR file'] 
    else: 
        log = find_Junctions_with_connections_count(root)
    res = {bjson_name : log}
    return res
        
logs = {}
with open('/app/python/scripts/xodr/urls_reduced_data.txt') as f:
    for line in f:
        res = search_url(line.strip())
        logs = logs | res
  
pyData = {'result':logs} # Print the data in stringified json format so that we can easily parse it in Node.js        
stringifiedNodeJsData = json.dumps(pyData) #stringifiedNodeJsData is <str>   #dumps (NOT dump) to write out json like string to be passed to print (stdou) // serialize python object to json
print(stringifiedNodeJsData)

