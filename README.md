# SAP Cloud Platform Portal Tutorial Samples

***
### Description
Sample resources for SAP Cloud Platform Portal tutorials, including custom Fiori applications, Portal widgets, and Shell Plugins.

The resources can also be used as a general code reference and starting point for development of custom content for SAP Cloud Platform Portal sites.

Please be advised that any downloads are subject to the following:

* These resources are provided without any warranty or support obligations.

* These resources are subject to the full terms of the license agreement (see below).


***
### Requirements
The included resources run in SAP Cloud Platform Portal sites available on any SAP Cloud Platform. To use the resources you need to have:
1. An SAP Cloud Platform account. Users who don't have an account can register to a free trial account. See [Sign up for a free trial account on SAP Cloud Platform](https://www.sap.com/developer/tutorials/hcp-create-trial-account.html).

2. Some of the resources connect to the **SAP ES5 Demo Gateway** system. This requires users to [create an account on the Gateway Demo System ](https://www.sap.com/developer/tutorials/gateway-demo-signup.html) and [configure a destination file](https://www.sap.com/developer/tutorials/teched-2016-3.html) on their SAP Cloud Platform account.


***
### Download and Installation
To use one of the included resources:
1. Clone the repository or download it to your file system.
2. Navigate **into** the desired `resource-name` folder (for example: apps/`productlist`/..)
3. Create a ZIP file from all of the underlying files:
	* Select all of the included files (Ctrl^A)
	* Right click and select 'Add to `resource-name`.zip (for example: `productlist.zip`)

	![CREATE ZIP](/_resources/installation_1.png).

4. Import the ZIP file into your SAP Web IDE
	* In the SAP Web IDE, right click on the **Workspace** folder and select Import > File or Project

	![IMPORT PROJECT](/_resources/installation_2.png).

	*  In the Import dialog browse and select the resource ZIP file you created.

	![SELECT ZIP](/_resources/installation_3.png).

5. Once the Import is complete, a new project folder is created in the SAP Web IDE. TO make it available in the Portal, deploy it to the SAP Cloud Platform.
	![DEPLOY PROJECT](/_resources/installation_4.png).

***
### Known Issues
There are no known issues relating to the resources included in this repository. Please refer to the **How to obtain support** for any issue you encounter.


***
### How to Obtain Support
For any issue you encounter with the resources in this repository or the tutorials associated with them please create a new `Issue` in the [Issues](https://github.com/SAP/cloud-portal-tutorial-samples/issues) section of this repository.

In addition, registered users can log-in and submit their question in the **SAP Community** by following [this link](https://answers.sap.com/questions/ask.html) .
Please select the **Primary Tag** - `SAP Cloud Platform Portal`.


***
### License

Copyright (c) 2017 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the SAP Sample Code License Agreement except as noted otherwise in the [LICENSE](LICENSE.md "LICENSE file").
