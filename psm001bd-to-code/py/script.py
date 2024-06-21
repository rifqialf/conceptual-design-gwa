from pprint import pprint
import os
import json
import jsbeautifier

# What to do for now: Create another PSM-JSON to Code transformation for a class with a simple relationship (?)
# What to do for now: Create another PSM-JSON to Code transformation for a class with stereotyped relationship
# When the python runs, user will be asked for JSON file
# There will be pre-processing of the JSON before we enter the classes of each targeted file
# The class will not read the JSON file, but rather a pre-navigated elements of the JSON


# Specify JSON, then copy the contents
project_path = (
    "C:/Users/alfat/Documents/Codes/thesis/conceptual-design-gwa/psm001bd-to-code/"  # This can be input
)
project_result_path = os.path.join(project_path, "result/")
json_file = "psm001bd.json"  # This can be input

with open(os.path.join(project_path, json_file)) as json_data:
    d = json.load(json_data)
    json_data.close()


# Navigate the JSON file and save several checkpoints
classes = d["$defs"]
classNames = classes.keys()


### Collection of functions for writing the JS file
def require_module(modules: list, module_name: str):
    return f'const {{ {", ".join(modules)} }} = require("{ module_name }");'


def export_module(modules: list):
    return f'module.exports = {{ {", ".join(modules)} }};'


def write_js_scripts(*scripts):
    script_list = []

    for script in scripts:
        if type(script) == list:
            for scr in script:
                if type(scr) == list:
                    for s in scr:
                        script_list.append(s)
                else:
                    script_list.append(scr)
        else:
            script_list.append(script)

    return "\n".join(script_list)


def write_file(folder_name, file_name, scripts):
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)

    with open(os.path.join(folder_name, file_name), "a") as js_file:
        js_file.write(scripts)


def generate_file(script_list, folder_name, file_name):
    scripts = write_js_scripts(script_list)

    write_file(folder_name, file_name, scripts)


# def combine_scripts(*script_lists):


def list_to_str(thelist: list):
    return ", ".join(thelist)


def read_href(href: str):
    if href[0] == "#":
        href = href.replace("#", json_file)
        href_list = href.split("/")
        class_name_anchor = href_list[-1]

        return globals()[class_name_anchor]


# To detect datatype and run function accordingly
# Not finished
def set_dtype(property: dict):
    datatypes = {
        "string": str,
        "integer": int,
        "object": dict,
        "array": list,
        "number": float,
        "void": None,
        # try except
    }

    geometryTypes = [
        "https://geojson.org/schema/Point.json",
        "https://geojson.org/schema/LineString.json",
        "https://geojson.org/schema/Polygon.json",
        "https://geojson.org/schema/MultiPoint.json",
        "https://geojson.org/schema/MultiLineString.json",
        "https://geojson.org/schema/MultiPolygon.json",
        "https://geojson.org/schema/GeometryCollection.json",
        "https://geojson.org/schema/Geometry.json",
    ]

    for datatype in datatypes.keys():
        if datatype == property["type"]:
            datatypes[datatype](property["default"])
            print(datatypes[datatype])


def module_props(class_name):
    return {
        "module": os.path.join(
            class_name.target_folder_name,
            class_name.target_file_name,
        ),
        "props": class_name.consisting_objects_names,
    }


################################################################


# Class: Pool | File: pool.js
class Pool:

    class_name = classes["Pool"]["$anchor"]
    properties = classes[class_name]["properties"]
    consisting_objects_names = []

    # Try to automate variables below as much as possible
    target_path = "src/config/"
    target_folder_name = os.path.join(project_result_path, target_path)
    target_file_name = "pool.js"
    modules = {"pg": ["Pool"]}
    properties = classes["Pool"]["properties"]

    # Attributes
    def __init__(self):
        self.user = self.properties["user"]["default"]
        self.host = self.properties["host"]["default"]
        self.database = self.properties["database"]["default"]
        self.password = self.properties["password"]["default"]
        self.port = self.properties["port"]["default"]

    def pool(self):
        return f"""{{
            user: {self.user},
            host: {self.host},
            database: {self.database},
            password: {self.password},
            port: {self.port}
            }}
            """

    def create_pool(self):
        return f"""
            const {self.modules["pg"][0]} = new {self.modules["pg"][0]} (
                {self.pool()}
            )
            """

    def query(query: str):
        test = f"""
        await pool.query(
            "{query}"
            );
            """
        return test

    # Function to create the result
    def generate_js_file(self):

        required_modules = []
        for module_name, properties in self.modules.items():
            required_modules.append(require_module(properties, module_name))

        export_modules = []
        for module_name, properties in self.modules.items():
            export_modules.append(export_module(properties))

        scripts = write_js_scripts(
            required_modules,
            self.create_pool(),
            export_modules,
        )

        if not os.path.exists(self.target_folder_name):
            os.makedirs(self.target_folder_name)

            with open(
                os.path.join(self.target_folder_name, self.target_file_name), "w"
            ) as js_file:
                js_file.write(scripts)


pool = Pool()


# Class: Building Data | File: model.js
class BuildingData:

    # Try to automate variables below as much as possible
    class_name = classes["BuildingData"]["$anchor"]
    properties = classes[class_name]["properties"]
    consisting_objects_names = []

    target_path = "src/model/"
    target_folder_name = os.path.join(project_result_path, target_path)
    target_file_name = "buildingdata.js"
    modules = {
        os.path.join(Pool.target_folder_name, Pool.target_file_name): Pool.modules["pg"]
    }

    # Attributes
    def __init__(self):
        self.query = self.properties["query"]

    def run_query(self):
        return f"""
        const {{ rows }} = {Pool.query(self.query["default"])}
        return {{ rows}}
        """

    def try_catcherrors(self):
        return f"""
        try {{
            {self.run_query()}
        }} catch (err) {{
            console.error("Error executing query", err)
        }}
        """

    def define_function(self, function_name: str, **function_params):
        self.consisting_objects_names.append(function_name)
        function_script = f"""
        async function {function_name}({list_to_str(function_params)}) {{
            {self.try_catcherrors()}
        }}
        """
        return function_script

    def prepare_scripts(self):
        scripts = []

        required_modules = []
        for module_name, properties in self.modules.items():
            required_modules.append(require_module(properties, module_name))
        scripts.append(required_modules)

        content = self.define_function("buildingData")
        scripts.append(content)

        export_modules = []
        export_modules.append(export_module(self.consisting_objects_names))
        scripts.append(export_modules)

        return scripts

    # Function to create the result
    def generate_js_file(self):
        generate_file(
            self.prepare_scripts(), self.target_folder_name, self.target_file_name
        )


buildingdata = BuildingData()


# Class: Building Data | File: model.js
class BusStopData:

    # Try to automate variables below as much as possible
    class_name = classes["BusStopData"]["$anchor"]
    properties = classes[class_name]["properties"]
    consisting_objects_names = []

    target_path = "src/model/"
    target_folder_name = os.path.join(project_result_path, target_path)
    target_file_name = "busstop_data.js"

    modules = {
        os.path.join(Pool.target_folder_name, Pool.target_file_name): Pool.modules["pg"]
    }

    # Attributes
    def __init__(self):
        self.query = self.properties["query"]

    def run_query(self):
        return f"""
        const {{ rows }} = {Pool.query(self.query["default"])}
        return {{ rows}}
        """

    def try_catcherrors(self):
        return f"""
        try {{
            {self.run_query()}
        }} catch (err) {{
            console.error("Error executing query", err)
        }}
        """

    def define_function(self, function_name: str, **function_params):
        self.consisting_objects_names.append(function_name)
        function_script = f"""
        async function {function_name}({list_to_str(function_params)}) {{
            {self.try_catcherrors()}
        }}
        """
        return function_script

    def prepare_scripts(self):
        scripts = []

        required_modules = []
        for module_name, properties in self.modules.items():
            required_modules.append(require_module(properties, module_name))
        scripts.append(required_modules)

        content = self.define_function("busstopData")
        scripts.append(content)

        export_modules = []
        export_modules.append(export_module(self.consisting_objects_names))
        scripts.append(export_modules)

        return scripts

    # Function to create the result
    def generate_js_file(self):
        generate_file(
            self.prepare_scripts(), self.target_folder_name, self.target_file_name
        )


busstopdata = BusStopData()


class FetchBuildingData:

    # Try to automate variables below as much as possible
    class_name = classes["FetchBuildingData"]["$anchor"]
    properties = classes[class_name]["properties"]
    consisting_objects_names = []

    target_path = "src/controller/"
    target_folder_name = os.path.join(project_result_path, target_path)
    target_file_name = "buildingDataFetcher.js"

    modules = {
        module_props(BuildingData)["module"]: module_props(BuildingData)["props"]
    }

    # Attributes
    def __init__(self):
        self.request = {}
        self.response = {}
        self.data = read_href(self.properties["data"]["type"]["href"])

    def create_json(self):
        return f"""
        res.json(rows);
        """

    def fetch_data(self):
        return f"""
        const {{ rows }} = await {self.modules[module_props(BuildingData())["module"]][0]}()
        {self.create_json()}
        """

    def try_catcherrors(self):
        return f"""
        try {{
            {self.fetch_data()}
        }} catch (err) {{
            console.error("Internal Server Error", err)
        }}
        """

    def define_function(self, function_name: str, **function_params):
        self.consisting_objects_names.append(function_name)
        function_script = f"""
        async function {function_name}({list_to_str(function_params)}) {{
            {self.try_catcherrors()}
        }}
        """
        return function_script

    def prepare_scripts(self):
        scripts = []

        required_modules = []
        for module_name, properties in self.modules.items():
            required_modules.append(require_module(properties, module_name))
        scripts.append(required_modules)

        content = self.define_function("getBuildingData", req="req", res="res")
        scripts.append(content)

        export_modules = []
        export_modules.append(export_module(self.consisting_objects_names))
        scripts.append(export_modules)

        return scripts

    # Function to create the result
    def generate_js_file(self):
        generate_file(
            self.prepare_scripts(), self.target_folder_name, self.target_file_name
        )


fetchbuildingdata = FetchBuildingData()


class FetchBusStopData:

    # Try to automate variables below as much as possible
    class_name = classes["FetchBusStopData"]["$anchor"]
    properties = classes[class_name]["properties"]
    consisting_objects_names = []

    target_path = "src/controller/"
    target_folder_name = os.path.join(project_result_path, target_path)
    target_file_name = "busstopDataFetcher.js"

    modules = {
        module_props(BusStopData())["module"]: module_props(BusStopData())["props"]
    }

    # Attributes
    def __init__(self):
        self.request = {}
        self.response = {}
        self.data = read_href(self.properties["data"]["type"]["href"])

    def create_json(self):
        return f"""
        res.json(rows);
        """

    def fetch_data(self):
        return f"""
        const {{ rows }} = await {self.modules[module_props(BusStopData())["module"]][0]}()
        {self.create_json()}
        """

    def try_catcherrors(self):
        return f"""
        try {{
            {self.fetch_data()}
        }} catch (err) {{
            console.error("Internal Server Error", err)
        }}
        """

    def define_function(self, function_name: str, **function_params):
        self.consisting_objects_names.append(function_name)
        function_script = f"""
        async function {function_name}({list_to_str(function_params)}) {{
            {self.try_catcherrors()}
        }}
        """
        return function_script

    def prepare_scripts(self):
        scripts = []

        required_modules = []
        for module_name, properties in self.modules.items():
            required_modules.append(require_module(properties, module_name))
        scripts.append(required_modules)

        content = self.define_function("getBusStopData", req="req", res="res")
        scripts.append(content)

        export_modules = []
        export_modules.append(export_module(self.consisting_objects_names))
        scripts.append(export_modules)

        return scripts

    # Function to create the result
    def generate_js_file(self):
        generate_file(
            self.prepare_scripts(), self.target_folder_name, self.target_file_name
        )


fetchbusstopdata = FetchBusStopData()


class BuildingRoute:

    # Try to automate variables below as much as possible
    properties = classes["BuildingRoute"]["properties"]
    consisting_objects_names = []

    target_path = "src/config/"
    target_folder_name = os.path.join(project_result_path, target_path)
    target_file_name = "building_route.js"

    modules = {
        "express": ["express"],
        module_props(FetchBuildingData())["module"]: module_props(FetchBuildingData())[
            "props"
        ],
    }

    # Attributes
    def __init__(self):
        self.method = "get"
        self.path = "/building"

    def start_express_router(self, router_name: str):
        self.consisting_objects_names.append(router_name)
        script = f"""
        const {router_name} = {self.modules["express"][0]}.Router();
        """
        return script

    def call_routers(self, function_name):
        function_script = f"""
        {function_name}()
        """
        return function_script

    def define_router_function(self, function_name: str, **function_params):
        function_script = f"""
        function {function_name}() {{
            {self.consisting_objects_names[0]}.{self.method}("{self.path}", {self.modules[module_props(FetchBuildingData())["module"]][0]});
        }}
        {self.call_routers(function_name)}
        """
        return function_script

    def prepare_scripts(self):
        scripts = []

        required_modules = []
        for module_name, properties in self.modules.items():
            required_modules.append(require_module(properties, module_name))
        scripts.append(required_modules)

        start_express = self.start_express_router("building_router")
        scripts.append(start_express)

        content = self.define_router_function("routers")
        scripts.append(content)

        export_modules = []
        export_modules.append(export_module(self.consisting_objects_names))
        scripts.append(export_modules)

        return scripts

    # Function to create the result
    def generate_js_file(self):
        generate_file(
            self.prepare_scripts(), self.target_folder_name, self.target_file_name
        )


buildingroute = BuildingRoute()


class BusStopRoute:

    # Try to automate variables below as much as possible
    properties = classes["BusStopRoute"]["properties"]
    consisting_objects_names = []

    target_path = "src/config/"
    target_folder_name = os.path.join(project_result_path, target_path)
    target_file_name = "busstop_route.js"

    modules = {
        "express": ["express"],
        module_props(FetchBusStopData())["module"]: module_props(FetchBusStopData())[
            "props"
        ],
    }

    # Attributes
    def __init__(self):
        self.method = "get"
        self.path = "/building"

    def start_express_router(self, router_name: str):
        self.consisting_objects_names.append(router_name)
        script = f"""
        const {router_name} = {self.modules["express"][0]}.Router();
        """
        return script

    def call_routers(self, function_name):
        function_script = f"""
        {function_name}()
        """
        return function_script

    def define_router_function(self, function_name: str, **function_params):
        function_script = f"""
        function {function_name}() {{
            {self.consisting_objects_names[0]}.{self.method}("{self.path}", {self.modules[module_props(FetchBusStopData())["module"]][0]});
        }}
        {self.call_routers(function_name)}
        """
        return function_script

    def prepare_scripts(self):
        scripts = []

        required_modules = []
        for module_name, properties in self.modules.items():
            required_modules.append(require_module(properties, module_name))
        scripts.append(required_modules)

        start_express = self.start_express_router("busstop_router")
        scripts.append(start_express)

        content = self.define_router_function("routers")
        scripts.append(content)

        export_modules = []
        export_modules.append(export_module(self.consisting_objects_names))
        scripts.append(export_modules)

        return scripts

    # Function to create the result
    def generate_js_file(self):
        generate_file(
            self.prepare_scripts(), self.target_folder_name, self.target_file_name
        )


busstoproute = BusStopRoute()


const_format = """
const {0} = {1}
"""

func_format = """
function {0}() = {1};
"""

def befunction(string, *params):
    if params:
        return f"{string}({params})"
    else:
        return f"{string}()"



class BackendServer:

    # Try to automate variables below as much as possible
    properties = classes["BackendServer"]["properties"]
    consisting_objects_names = []

    target_path = "src/"
    target_folder_name = os.path.join(project_result_path, target_path)
    target_file_name = "server.js"

    modules = {
        "express": ["express"],
        "cors": ["cors"],
        module_props(BuildingRoute())["module"]: module_props(BuildingRoute())["props"],
        module_props(BusStopRoute())["module"]: module_props(BusStopRoute())["props"],
    }

    # Attributes
    def __init__(self):
        self.port = self.properties["port"]["default"]

    def start_express_app(self, function_name):
        function_script = const_format.format(function_name, befunction(self.modules["express"][0]))
        return function_script

    def define_port(self, function_name):
        self.consisting_objects_names.append(function_name)
        function_script = const_format.format(function_name, self.properties["port"]["default"])
        return function_script

    def use_middleware(self, middleware):
        function_script = f'app.use({middleware})'
        return function_script
    
    def use_route(self, path, route):
        function_script = f"app.use('{path}', {route})"
        return function_script
    
    def start_server(self):
        function_script = f"""app.listen(port, () => console.log('Server is running on port {self.port}'))"""
        return function_script




    def prepare_scripts(self):
        scripts = []

        required_modules = []
        for module_name, properties in self.modules.items():
            required_modules.append(require_module(properties, module_name))
        scripts.append(required_modules)

        start_express_app = self.start_express_app("app")
        scripts.append(start_express_app)

        define_port = self.define_port("port")
        scripts.append(define_port)

        use_cors = self.use_middleware(befunction(self.modules["cors"][0]))
        scripts.append(use_cors)

        use_building_routes = self.use_route('/', self.modules[module_props(BuildingRoute())["module"]][0])
        scripts.append(use_building_routes)

        use_busstop_routes = self.use_route('/', self.modules[module_props(BusStopRoute())["module"]][0])
        scripts.append(use_busstop_routes)

        start_server = self.start_server()
        scripts.append(start_server)

        return scripts

    # Function to create the result
    def generate_js_file(self):
        generate_file(
            self.prepare_scripts(), self.target_folder_name, self.target_file_name
        )

backendserver = BackendServer()


################################################################

# Main entry point
if __name__ == "__main__":

    # Class: Pool
    pool.generate_js_file()
    buildingdata.generate_js_file()
    busstopdata.generate_js_file()
    fetchbuildingdata.generate_js_file()
    fetchbusstopdata.generate_js_file()
    buildingroute.generate_js_file()
    busstoproute.generate_js_file()
    backendserver.generate_js_file()
    
    # print(FetchBuildingData().define_function("getBuildingData"))
    # for folderName, subfolder, files in os.walk("./result/src/config"):
    #     for file in files:
    #         jsbeautifier.beautify_file(file)


print("Done!")

# Continue with creating the other classes
