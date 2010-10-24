#!/usr/local/bin/python2.6

def cleanup():
	infile = open("2008HMDALAR - National.CSV", "r")
	outfile = open("2008HMDALAR-clean1.csv", "w")

	numgood = 0
	for line in infile:
		split = line.split(',')
		arr,shouldWrite = getFields(split)
		if shouldWrite:
			outfile.write(','.join(arr)+"\n")
			numgood += 1
	print numgood
		#outfile.write(','.join(getFields(split))+"\n")
	
	
def getFields(arr):
	ret = True
	if safe(arr[33]) == "-1" or safe(arr[11]) == "-1":
		return [], False
	else:
		return [
			safe(arr[0]),			# Year
			safe(arr[1]), 			# Respondent ID
			safe(arr[2]), 			# Agency Code
			safe(arr[3]), 			# Loan Type
			safe(arr[4]), 			# Property Type
			safe(arr[5]), 			# Loan Purpose
			str(int(safe(arr[7]))), 		# Loan Amount
			safe(arr[8]), 			# Preapproval
			safe(arr[9]),			# Action Taken
			safe(arr[11]),			# State Code
			safe(arr[12]),			# County Code
			safe(arr[13]),			# Tract
			safe(arr[14]),			# Ethnicity
			safe(arr[16]),			# Race
			safe(arr[26]),			# Sex
			str(int(safe(arr[28]))),		# Income
			safe(arr[29]),			# Purchaser Type
			safe(arr[30]),			# Denial Code
			safe(arr[33])			# Rate Spread
			],ret

def safe(item):
	if item == " " or len(item) >= 2 and item[0:2] == "NA":
		return "-1"
	else:
		return item
	

if __name__ == '__main__':
	cleanup()

	
	
	