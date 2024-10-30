# Description
Search a binary reduced open drive data (see asset extractor) using a set of pre-implemented python search scripts based on various predefined search parameters (criteria)

# Motivation
The need for efficient, flexible and focused open drive data exploration.

# Build docker image
    docker build --no-cache -t extended-search .    

# How to run
    1. docker run -p 3000:3000 extended-search
    2. Open a client (on a browser open): http://localhost:3000/search
