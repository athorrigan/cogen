const
    courseApi = require('../api/course_service'),
    process = require('process')
;

courseApi.createCourse(
    {
        "courseTitle": "SVS Labs",
        "courseSlug": "",
        "courseName": "Solution Validation Services",
        "splashTitle": "LAB INFORMATION",
        "splashInstructions": "Please select 'Student' from the dropdown!",
        "userNomenclature": "Student",
        "coursePath": "svs-labs",
        "children": [
            {
                "name": "Welcome",
                "id": "510147243915",
                "data": "<p class=\"text-center\"><img style=\"width: 80%; height: 80%\" src=\"/images/SVS_Logo.png\" /></p>",
                "path": "howto-rollback-cloudcenter-lab"
            },
            {
                "name": "HowTo: Connect",
                "id": "269925080595",
                "data": "<style type=\"text/css\">span.step {\n    color: rgb(240, 76, 55);\n    font-weight: bold;\n}</style><h1>HowTo: Connect</h1><p>This page explains how to connect to the SVS Cisco Live environment.</p><p>There are 28 pods.</p><ul><li><strong>student01-student20</strong> are for the CloudCenter and SAE labs</li><li><strong>student21-student25</strong> are for the WISP lab</li><li><strong>student26-student28</strong> are for Lab Proctors and Generic-Use</li></ul><h2>AnyConnect</h2><p><span class=\"step\">STEP 1:</span> Open AnyConnect. Please ensure you are using the most recent version. Click on the small gray gear icon to open <strong>Preferences</strong>.</p><p><span class=\"step\">STEP 2:</span> Ensure the box <em>&quot;Block Connections to untrusted servers&quot;</em> is <strong>UNchecked</strong>. Close Preferences.</p><p><span class=\"step\">STEP 3:</span> In the box, type <strong>173.38.117.198</strong> and click <strong>Connect</strong>.</p><p><span class=\"step\">STEP 4:</span> When the Security Warning appears, click <strong>Connect Anyway</strong> to continue.</p><p><span class=\"step\">STEP 5:</span> On the login prompt, ensure the dropdown is on CiscoLive.</p><p><span class=\"step\">STEP 6:</span> For the username and password, <strong>(lab-name)-student</strong> and <strong>(Will Be Provided)</strong>. Click <strong>OK</strong> to login.</p><div class=\"important-note\"><ul><li>Login for <strong>SAE</strong> is <strong>sae-student</strong></li><li>Login for <strong>C3</strong> is <strong>c3-student</strong></li><li>Login for <strong>WISP</strong> is <strong>wisp-student</strong></li><li>Login for <strong>General Cisco Live Purposes</strong> is <strong>cl-student</strong></li></ul></div><p><span class=\"step\">STEP 7:</span> When the Banner appears (not pictured), click <strong>Accept</strong> to connect the VPN. If successful, the AnyConnect window will read <em>&quot;Connected to 173.38.117.198&quot;</em></p><div class=\"warning-note\">AnyConnect may &quot;bounce&quot; (disconnect and reconnect) the connection. This is normal behavior. It will happen approximately 30-45 seconds after the initial connect is made.</div><p><img src=\"/uploads/df85b4dd-0cf0-c4e1-2255-5a0fbc53fe15.png\" /></p><h2>Remote Desktop</h2><div class=\"important-note\">Please only use the official Microsoft Remote Desktop Application. For Mac users, the application can be downloaded from the AppStore. The 2008 version will NOT work.</div><p>Each pod has an IP address of <strong>10.1.30.1X</strong>, where <strong>X</strong> is the student number. For pods 0-9, please use the leading <strong>&quot;O&quot;</strong> for the IP address and the username.</p><p>The password for every pod is <strong>(Will Be Provided)</strong></p><p>The following screenshots can be used to create your RDP profile. Windows is on the left, Mac is on the right.</p><div class=\"important-note\"><strong>WISP LAB PROCTORS</strong> It is recommended to check the <strong>Use all monitors</strong> option! This allows the students to open the lab guide on one monitor while configuring on the other. It also means the hotlinks in the lab will work.</div><p class=\"text-center\"><img src=\"/uploads/185691bd-a006-c4af-4400-28194177d8ab.png\" /></p><p>&nbsp;</p><p class=\"text-center\">Welcome to the SVS Lab Environment!</p><p>&nbsp;</p><p class=\"text-center\"><img style=\"width: 40%; height: 40%\" src=\"/uploads/abfa0437-9512-24f6-2bc0-aff8bc92bfd4.png\" /></p>",
                "path": "howto-connect"
            },
            {
                "name": "HowTo: Reset Viptela",
                "id": "438027301851",
                "data": "<style type=\"text/css\">span.step {\n    color: rgb(240, 76, 55);\n    font-weight: bold;\n}</style><h1>HowTo: Reset Viptela</h1><div class=\"warning-note\"><strong>Please be extremely careful using this script!</strong></div><p>Thanks to Cory Withers, reseting the Viptela pod is extremely easy! Once the lab has been completed, follow these steps ...</p><p><span class=\"step\">STEP 1:</span> Ensure the Desktop is in a &quot;good state&quot;. Here are some things to check:</p><ul><li>Ensure the bookmarks are still present in Chrome. Close Chrome.</li><li>Ensure all (6) SSH connections are present in Smartty. Close Smartty.</li><li>Ensure all (25) bootstrap files are present. Close File Explorer.</li></ul><p><span class=\"step\">STEP 2:</span> Open Powershell. Navigate to the correct folder:</p><pre>cd Z:\\Viptela\\vEdge-Bootstraps\\viptela_cleanup</pre><div class=\"note\">The script folder is hidden and cannot be seen in the File Explorer</div><p><span class=\"step\">STEP 3:</span> The command format to reset a pod is <strong>python .\\reset_pod.py [student-number] [new bootstrap save location]</strong>For example:</p><pre> python .\\reset_pod.py 21 &quot;..&quot;\n</pre><p>The script will do the following actions, as indicated by it&#39;s working output (example):</p><pre>Decomissioning vEdge 50589b86-2faa-43c5-8d39-5e41f3c8b7a5\nCreating bootstrap file for vEdge 50589b86-2faa-43c5-8d39-5e41f3c8b7a5\nShutting down vEdge s21-vEdge on CSP\nService s21-vEdge has been shut down.\nDeleting vEdge s21-vEdge from CSP\nService s21-vEdge has been removed.\n</pre><div class=\"important-note\">If you received an error regarding <em>requests</em>, please run this command in Powershell: <strong>C:\\Python27\\python.exe -m pip install requests</strong></div><p><span class=\"step\">STEP 4:</span> Once the script has been ran, close Powershell. Before exiting the jump host, you want to ensure the vEdge is deleted from WISP-CSP (10.1.60.28) and that the vEdge is decommissioned - <strong>Better Safe Than Sorry!</strong>.</p>",
                "path": "howto-reset-viptela"
            },
            {
                "name": "HowTo: Rollback C3 Lab",
                "id": "799432697118",
                "data": "<p>Please use the following procedure the rollback the CloudCenter Lab</p><p><img src=\"/uploads/e10039b0-52ea-a2a4-9712-b780a2643c54.jpg\" /></p>",
                "path": "howto-rollback-c3-lab",
                "children": [
                    {
                        "name": "Check Deployments",
                        "id": "685181015596",
                        "data": "<p>After students are finished with the lab, wait until all deployments have been automatically terminated via the applied aging policies. Please check the following sources to make sure that all deployments have been terminated.</p><ol><li>Check <strong>vc-aci</strong>. &nbsp;Make sure there are no VMs deployed under the student folders.<br /><img width=\"315\" height=\"452\" src=\"/uploads/ffab133f-3a34-3654-b452-c486264ab3a6.jpg\" /></li><li>Check AWS. (there should only be four VMs there)<br /><img src=\"/uploads/2625b905-86db-b072-bd60-0a9dd2095371.jpg\" /><br />&nbsp;</li><li>Check the <a href=\"http://10.1.200.50:5000/\">CC-Help App</a>. &nbsp;Here, you should not see any ACTIVE deployments.<br /><img width=\"1050\" height=\"341\" src=\"/uploads/92d5df4b-dbe2-b6da-d7f0-2fa71fd5bd87.jpg\" /><br />&nbsp;</li><li>Login to the CCM as Admin, and check Deployments. &nbsp;If you see deployments that are STOPPED, but not TERMINATED, then Terminate-and-hide them.<br /><img src=\"/uploads/6a71f5ec-3242-0a73-09c1-b75c8644550d.jpg\" /></li></ol>",
                        "path": "check-deployments"
                    },
                    {
                        "name": "Shutdown CCM+CCO+AMQP",
                        "id": "92934156889",
                        "data": "<p>SSH to the CCM, CCO and AMQP (I only rolled back the ACI and OpenStack ones, I did not rollback the AWS ones, so please make absolutely sure that all the student deployments have been terminated prior to rolling back the CCM)</p><p>Wait until they are all powered off.</p><p><img src=\"/uploads/36b2fc61-4932-7e4a-f48e-9c05379d818d.jpg\" /></p>",
                        "path": "shutdown-ccmccoamqp"
                    },
                    {
                        "name": "Rollback CCM",
                        "id": "163583507356",
                        "data": "<h1>Rollback CCM</h1><p>We&#39;ll start with the CCM and CCO/AMQP running on the infrastructure vCenter</p><ul><li>Goto to the infrastructure vCenter (vc-svs)</li><li>Make sure the CCM is in a powered off state</li><li>Then goto the <strong>Snapshot Manager</strong> for the CCM<br /><br /><img src=\"/uploads/fabde5df-e73f-98a2-c022-3e7c39e437c1.jpg\" /><br />&nbsp;</li><li>Then choose snapshot <em><span style=\"color:#2b5592;\"><strong>CLEU18-CCM-AllSubTenants</strong></span></em><span style=\"color:null;\">, then click &#39;Go to&#39;</span><br /><br /><img src=\"/uploads/c0e344d4-b7e8-d7a9-1606-9ac8d4eda508.jpg\" /><br />&nbsp;</li><li>When the snapshot is restored, Power up the VM</li><li>SSH to the VM</li><li>Turn off <span style=\"color:#2b5592;\"><strong>WalkMe</strong></span>, but editing the <em><strong><span style=\"color:#2b5592;\">config.js</span></strong></em> file, and adding&nbsp;&nbsp;<span style=\"color:#049fd9;\"><em><strong>var loadWalkMe = false;</strong></em></span><span style=\"color:null;\">&nbsp;toward the top of the file.</span></li></ul><ol><li><pre>vim /usr/local/tomcat/webapps/ROOT/config.js</pre></li></ol><p>&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<img src=\"/uploads/7b3081f1-6170-93b5-ae8f-f129e1d4bafd.jpg\" /></p><ul><li>Now tail the <span style=\"color:#2b5592;\"><em><strong>osmosix.log</strong></em></span></li></ul><ol><li><pre>tailf /usr/local/tomcat/logs/osmosix.log</pre></li></ol><ul><li>When the activity calms down, move onto restoring the CCO and AMQP</li></ul>",
                        "path": "rollback-ccm"
                    },
                    {
                        "name": "Rollback ACI AMQP",
                        "id": "151920449802",
                        "data": "<h1>Rollback ACI&nbsp;AMQP</h1><p>We&#39;ll start with the AMQP first, that way it comes up first and is listening for the CCO connection.</p><ul><li>Goto to the infrastructure vCenter (vc-svs)</li><li>Make sure the AMQP is in a powered off state</li><li>Then goto the <strong>Snapshot Manager</strong> for the AMQP<br /><br /><img src=\"/uploads/6fa91844-f961-765a-1c20-68de2feafa5a.jpg\" /><br />&nbsp;</li><li>Then choose snapshot <em><span style=\"color:#2b5592;\"><strong>CLEU18-AMQP-AllSubTenants</strong></span></em><span style=\"color:null;\">, then click &#39;Go to&#39;</span><br /><br /><img src=\"/uploads/0ca73972-a7cc-431c-640c-24cf87b6fd3a.jpg\" /><br />&nbsp;</li><li>When the snapshot is restored, Power up the VM</li><li>Wait a while for the AMQP to fully come up, then move onto the CCO</li></ul>",
                        "path": "rollback-aci-amqp"
                    },
                    {
                        "name": "Rollback ACI CCO",
                        "id": "862534332307",
                        "data": "<h1>Rollback ACI CCO</h1><ul><li>Goto to the infrastructure vCenter (vc-svs)</li><li>Make sure the CCO is in a powered off state</li><li>Then goto the <strong>Snapshot Manager</strong> for the CCO<br /><br /><img src=\"/uploads/02f67564-1548-924e-9fc6-97d6205d8757.jpg\" /></li><li>Then choose snapshot <em><span style=\"color:#2b5592;\"><strong>CLEU18-CCO-AllSubTenants</strong></span></em><span style=\"color:null;\">, then click &#39;Go to&#39;</span><br /><br /><img src=\"/uploads/7bfb8d40-f17c-0174-c5ce-9601bb68474f.jpg\" /></li><li>When the snapshot is restored, Power up the VM</li><li>Wait a while for the CCO to fully come up</li><li>SSH to the AMQP, and check to make sure the CCO is listed</li></ul><pre>[root@CiscoLive-ACI-AMQP ~]# rabbitmqctl list_connections\nListing connections ...\ncliqr   10.1.200.126    36906   running</pre><ul><li>If the CCO is listed, now move onto rolling back the OpenStack VMs</li></ul>",
                        "path": "rollback-aci-cco"
                    },
                    {
                        "name": "Rollback OpenStack AMQP",
                        "id": "557885251493",
                        "data": "<h1>Rollback OpenStack&nbsp;AMQP &amp; CCO</h1><p>We&#39;ll start with the AMQP first, that way it comes up first and is listening for the CCO connection.</p><div class=\"note\">Use the same procedure for the CCO. Only the AMQP is shown below.</div><p>The procedure for OpenStack is a bit different then for VMware, as you can not just simply rollback to a snapshot in OpenStack. &nbsp;Instead, we will need to create a <u><em><strong>new</strong></em></u> CCO and AMQP from the snapshot image.</p><ul><li>Log into Horizan using <span style=\"color:#2b5592;\"><em><strong>cliqr-admin</strong></em></span><br /><br /><img src=\"/uploads/4f7c9004-3875-09d3-53cc-b6d923af481c.jpg\" /><br />&nbsp;</li><li>Goto <span style=\"color:#2b5592;\"><strong>Project &gt; Instances</strong></span><br /><br /><img src=\"/uploads/ccf2eec0-d2c9-5bfd-08d1-a07c895c8fb1.jpg\" /></li><li>Make sure the AMQP is in a powered off state<br /><br /><img src=\"/uploads/56c0a6b8-734b-ecd3-dfc2-8790fd860be8.jpg\" /><br />&nbsp;</li><li>Disassociate the Floating IP Address<br /><br /><img src=\"/uploads/68fcb3a7-196b-f9a5-aed8-75f0439ebc45.jpg\" /><br />&nbsp;</li><li>(optional) Teminate the instance.<br /><br /><img src=\"/uploads/50cd72db-ca73-dc6c-2970-e211994cc050.jpg\" /></li><li>Launch a new Instance<br /><br /><img src=\"/uploads/49fcf33b-883d-dffc-ac40-f99d8f2d25d9.jpg\" /><br />&nbsp;</li><li>Use the following information.</li></ul><div class=\"warning-note\">Make sure you choose <em><strong>infra-az</strong></em>, and choose <em><strong>Boot from snapshot</strong></em> as the image source</div><p><img src=\"/uploads/edbf7ad1-71ca-a52e-8400-071f218ebe05.jpg\" /></p><p><img src=\"/uploads/83b85c34-81c7-bef6-4080-f345de95fca1.jpg\" /></p><p><img src=\"/uploads/3d7bf978-f033-536b-d311-6159b9f04501.jpg\" /></p><ul><li>Click Launch<br />&nbsp;</li><li>Once it starts creating the image, choose <span style=\"color:#2b5592;\"><strong><em>Associate Floating IP</em></strong></span><ul><li><span style=\"color:#64bbe3;\">AMQP =&nbsp;10.1.202.176</span></li><li><span style=\"color:#64bbe3;\">CCO =&nbsp;10.1.202.175</span><br />&nbsp;</li></ul></li><li>Then select Edit Security Groups<br /><br /><img src=\"/uploads/f27cac5b-a30c-20f5-bf36-e600c192f358.jpg\" /><br />&nbsp;</li><li>And then:<ul><li>(<span style=\"color:#6cc04a;\">add</span>) AllowAny</li><li>(<span style=\"color:#cf2030;\">remove</span>) default</li></ul></li></ul><p><br /><img src=\"/uploads/862111e0-4776-6a16-8c07-6c63779cfbbd.jpg\" /><br />&nbsp;</p><ul><li>Since the hostname will change on the instances created from the snapshots, you will need to delete the .RABBITINSTALLED file<ul><li>SSH to the AMQP</li><li><pre>rm /usr/local/osmosix/etc/.RABBITINSTALLED</pre></li><li>Then Reboot<br />&nbsp;</li></ul></li><li>Once the AMQP is fully up, check to see if the CCO shows up under the <strong><em>list_connections</em></strong>, if not, reboot the CCO too.</li></ul>",
                        "path": "rollback-openstack-amqp"
                    },
                    {
                        "name": "At the CCM UI",
                        "id": "633160191117",
                        "data": "<h1>At the CCM UI</h1><h2>1) Re-sync the CCO&#39;s</h2><p>Goto Admin &gt; Clouds, then goto each Cloud and each Region, and Configure Orchestrator (do not change anything, just click SAVE to re-sync</p><p><img src=\"/uploads/690539da-f11d-0bf7-83d6-b40547bf16cd.jpg\" /></p><p><img src=\"/uploads/2c28972f-49dc-3773-72e2-e37af1241f4c.jpg\" /></p><h2>2) Share down the Public Deployment Env as Manage</h2><p><img src=\"/uploads/625eab05-3c05-b35b-d28a-42561d324c7f.jpg\" /></p><p><img src=\"/uploads/3186071a-06e3-b970-37ce-0e0edbb6f2b6.jpg\" /></p><p><img src=\"/uploads/2e1f537b-4673-8f64-4269-964a4e9b7dc5.jpg\" /></p><h2>3) Share down the Actions Library scripts</h2><p>Share them down as VIEW</p><ul><li>Remove Stress</li><li>Install Stress</li></ul><p><img src=\"/uploads/aed6baa0-f6ba-e396-8320-aa966379d08f.jpg\" /></p><p>&nbsp;</p>",
                        "path": "at-the-ccm-ui"
                    }
                ]
            }
        ],
        "buttons": [
            {
                "name": "Information",
                "selector": "information",
                "description": "Information",
                "icon": "info",
                "id": "343993433",
                "data": "Course Info"
            }
        ]
    },
    (err, course) => {
        if (err) {
            console.log(err);
        }
        console.log(course);

        process.exit(0);
    }
);