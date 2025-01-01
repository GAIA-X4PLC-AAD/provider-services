# SD Creation Wizard API

This backend service is standalone service which edited to be started along the asset-extractor service and sd-creation-wizard-frontend with simply: docker-compose up --build
The original api is on:
[Gaia-X-sd-creation-wizard-api](https://gitlab.eclipse.org/eclipse/xfsc/self-description-tooling/sd-creation-wizard-api) 

Backend service to convert an input shacl shape into JSON form for the frontend service.
- Input is expected to be a MultipartFile file.
- Output object is ShaclModel.java. It consists of a list of json objects for prefixes in the input file and another list of json objects for the shapes listed in the input file.
- Alternatively input can be two MultipartFiles (one .ttl SHACL Shape, one .json Claim-File), behaviour is the same, but the answer would be a ResponseShaclJsonPair.java, which consists out of a ShaclModel.java and a Map of Strings containing overlapping attributes. This would be done such that the Frontend can prefill the displayed FormFields.
- Each shape is depicted in VicShape.java. Shape name is stored in variable schema. Properties of the shape are stored in variable called 'constraints' which is of type ShapeProperties.java.
- Test instances can be found under src/test/resources.
- JUnit test cases can be found under src/test/java.

Sample input: 

```
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex: <http://www.w3.org/example#> .

schema:PersonShape
    a sh:NodeShape ;
    sh:targetClass ex:Person ;
    sh:property [
        sh:path schema:givenName ;
        sh:datatype xsd:string ;
        sh:name "Peter Parker" ;
        sh:minCount 1;
        sh:maxCount 1;
        sh:minLength 3;
        sh:maxLength 8;
        sh:order 1

    ] ;
    sh:property [
        sh:path schema:gender ;
        sh:in ( "female" "male" ) ;
        sh:minCount 1;
        sh:maxCount 1;
        sh:order 2;
    ] ;
    sh:property [
        sh:path schema:birthDate ;
        sh:minCount 1;
        sh:maxCount 1;
        sh:order 3;
    ] ;

    sh:property [
        sh:path schema:age ;
        sh:minCount 1;
        sh:maxCount 1;
        sh:minInclusive 18 ;
        sh:maxInclusive 65 ;
    ] .

```

Corresponding output: 

```

{
    "prefixList": [
        {
            "alias": "schema",
            "url": "http://schema.org/"
        },
        {
            "alias": "ex",
            "url": "http://www.w3.org/example#"
        },
        {
            "alias": "rdf",
            "url": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
        },
        {
            "alias": "sh",
            "url": "http://www.w3.org/ns/shacl#"
        },
        {
            "alias": "xsd",
            "url": "http://www.w3.org/2001/XMLSchema#"
        },
        {
            "alias": "rdfs",
            "url": "http://www.w3.org/2000/01/rdf-schema#"
        }
    ],
    "shapes": [
        {
            "schema": "PersonShape",
            "targetClassPrefix": "ex",
            "targetClassName": "Person",
            "constraints": [
                {
                    "path": {
                        "prefix": "schema",
                        "value": "age"
                    },
                    "minCount": 1,
                    "maxCount": 1,
                    "validations": [
                        {
                            "key": "maxInclusive",
                            "value": 65
                        },
                        {
                            "key": "minInclusive",
                            "value": 18
                        }
                    ]
                },
                {
                    "path": {
                        "prefix": "schema",
                        "value": "birthDate"
                    },
                    "minCount": 1,
                    "maxCount": 1,
                    "order": 3
                },
                {
                    "path": {
                        "prefix": "schema",
                        "value": "gender"
                    },
                    "minCount": 1,
                    "maxCount": 1,
                    "in": [
                        {
                            "value": "female"
                        },
                        {
                            "value": "male"
                        }
                    ],
                    "order": 2
                },
                {
                    "path": {
                        "prefix": "schema",
                        "value": "givenName"
                    },
                    "name": "Peter Parker",
                    "datatype": {
                        "prefix": "xsd",
                        "value": "string"
                    },
                    "minCount": 1,
                    "maxCount": 1,
                    "order": 1,
                    "validations": [
                        {
                            "key": "maxLength",
                            "value": 8
                        },
                        {
                            "key": "minLength",
                            "value": 3
                        }
                    ]
                }
            ]
        }
    ]
}

```

# Supported SHACL Features ("Rules")
The SD Creation Wizard supports many features from the [W3C Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/):
- `sh:minLength` and `sh:maxLength`: Length of textual (string) values
- `sh:minCount` and `sh:maxCount`: Specify mandatory attributes and declare their expected cardinality
- `sh:minInclusive`, `sh:maxInclusive`, `sh:minExclusive`, `sh:maxExclusive`: Ranges for numerical values
- `sh:order`: Control the ordering of attributes in the SD Creation Wizard UI.
- `sh:group`: Group multiple attributes into logical areas in the UI.
- `sh:path` with `sh:class` or `sh:datatype`: Specify the type of attributes and their targets, which can be classes or simple datatypes like string, URI, decimal, etc.
- `sh:name` and `sh:description`: Human-readable text and description in natural language. Multiple languages are supported.
- `skos:example`: List one or more example values to make field completion more convenient for end users.
- `sh:or`: Basic support for logical operators.








