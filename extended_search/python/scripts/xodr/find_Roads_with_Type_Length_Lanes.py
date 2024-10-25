import sys, json ,os

################ parameters ########################
try:
    nodeJsData = json.load(sys.stdin) # nodeJsData is <dict>   #load (NOT loads) to read from stream sys.stdin
except json.JSONDecodeError as err:
    json.dumps({'result': err})
    sys.exit(1)

road_type = nodeJsData['name_of_road_type']#'motorway'
road_min_length = int(nodeJsData['lane_minimum_length']) #1000.0
lane_type = nodeJsData['name_of_lane_type'] #"driving"
lanes_minimum_count = int(nodeJsData['lanes_minimum_count']) #4

################ search functions ########################
def check_Lanes(laneSection):
    lane_count = 0
    for lane in laneSection.findall("./left/lane"):
        if lane.attrib["type"] == lane_type:
            lane_count += 1
    if lane_count >= lanes_minimum_count: # BUG => Mirco, if lane_min_count = 0 , this return always true even if lane_type doesnot match!!
        return True
    
    lane_count = 0
    for lane in laneSection.findall("./right/lane"):
        if lane.attrib["type"] == lane_type:
            lane_count += 1
    if lane_count >= lanes_minimum_count:
        return True            
    
    return False

def find_Roads_with_Type_Length_Lanes(root):
    log = list()
    for road in root.findall("./road"):
        foundType = False
        if float(road.attrib["length"]) >= road_min_length:
            for type in road.findall("./type"):
                if type.attrib["type"] == road_type:
                    foundType = True
                    break
        if foundType:
            for laneSection in road.findall("./lanes/laneSection"):
                if check_Lanes(laneSection):
                    log.append("matching track found in Road " + road.attrib["id"] + " in laneSection with s = " + laneSection.attrib["s"])
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
        log = find_Roads_with_Type_Length_Lanes(root)
    res = {bjson_name : log}
    return res
        
logs = {}
with open('/app/python/scripts/xodr/urls_reduced_data.txt') as f:
    for line in f:
        res = search_url(line.strip())
        logs = logs | res

pyData = {'result':logs} # Print the data in stringified json format so that we can easily parse it in Node.js        
stringifiedNodeJsData = json.dumps(pyData, ensure_ascii=False) #stringifiedNodeJsData is <str>   #dumps (NOT dump) to write out json like string to be passed to print (stdou) // serialize python object to json
print(stringifiedNodeJsData)
