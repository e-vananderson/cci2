# -*- coding: utf-8 -*-
"""
Created on Tue May 11 00:35:53 2021

@author: Dan
"""

import sys

def get_selected_data(data):
    f = open("fairify_selection.txt", "w")
    f.write(data)
    f.close()
    
# get_selected_data('test')
get_selected_data(sys.argv[1])