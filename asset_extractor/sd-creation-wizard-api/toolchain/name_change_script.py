from os import walk, rename

dir_path = '../shapes/'
res = []

for (dir_path, dir_names, file_names) in walk(dir_path):
    for file in file_names:
        if str(file).endswith(".ttl"):
            src = dir_path + "/" + file
            new_name = file.replace('Shape', '')
            dst = dir_path + "/" + new_name
            print(dst)
            rename(src,dst)
