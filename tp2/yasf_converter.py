import json

def process_json(input_file, output_file):
    # Load the JSON file
    with open(input_file, 'r') as file:
        data = json.load(file)
    
    print("Processing JSON file: %s" % input_file)
    # get graph from file
    yasf = data.get("yasf")
    graph = yasf.get("graph")
    print("Processing graph: %s\n" % graph)

    # Iterate over all objects in the JSON
    for key, value in graph.items():
        print("Processing %s: %s\n" % (key, value) )
        if "children" in value:
            children = value["children"]
            print("Processing child: %s\n:" % children)
            nodes_list = []
            # Collect nodeIds and remove noderef objects
            for child_key, child_value in list(children.items()):
                if child_value.get("type") == "noderef":
                    node_id = child_value.get("nodeId")
                    if node_id:
                        nodes_list.append(node_id)
                    del children[child_key]
            # Append the nodesList if there are any collected nodeIds
            if nodes_list:
                value["children"]["nodesList"] = nodes_list
                print("nodes_list: %s\n:", value["children"]["nodesList"])

    print("Finalized graph: %s\n" % graph)
    
    # Save the updated JSON back to a file
    with open(output_file, 'w') as file:
        json.dump(data, file, indent=4)

# Example usage
input_file = './scenes/scene/scene.json'  # Replace with your input file name
output_file = './scenes/scene/new_scene.json'  # Replace with your desired output file name
process_json(input_file, output_file)