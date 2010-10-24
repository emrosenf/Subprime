#!/usr/local/bin/python2.6

def cleanup():
	infile = open("2008HMDAInstitutionRecords.TXT", "r")
	outfile = open("2008Instutions-clean.csv", "w")

	for line in infile:
		split = line.split('\t')
		outfile.write(','.join(getFields(split))+"\n")
	
	
def getFields(arr):
	return [
		safe(arr[1]), 					# Respondent ID
		safe(arr[4]), 					# Respondent Name
		safe(arr[9]), 					# Parent Name
		str(int(safe(arr[20])))	 		# LAR count
		]

def safe(item):
	if item == "" or len(item) >= 2 and item[0:2] == "NA":
		return "-1"
	else:
		return item
	

if __name__ == '__main__':
	cleanup()
