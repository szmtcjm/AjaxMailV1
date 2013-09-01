<?php
    require_once("inc/config.inc.php");
    require_once("inc/pop3lib/pop3.class.php");
    require_once("inc/pop3lib/pop3message.class.php");
    require_once("inc/pop3lib/pop3header.class.php");
    require_once("inc/pop3lib/pop3attachment.class.php");
    require_once("inc/AjaxMail.inc.php");
    require_once("inc/JSON.php");
    
    //headers
    header("Cache-control: No-Cache");
    header("Pragma: No-Cache");

    //get information
    $folder = $_GET["folder"];
    $page = (int) $_GET["page"];
    $id = "";
    if (isset($_GET["id"])) {
        $id = (int) $_GET["id"];
    }
    $action = $_GET["action"];

    //create new mailbox
    $mailbox = new AjaxMailbox();

    //create JSON object in case its needed
    $oJSON = new JSON();
    
    $output = "";
    
    switch($action) {
        case "getfolder":
            $info = $mailbox->getFolderPage($folder, $page);
            $output = $oJSON->encode($info); 
            break;
        case "getmessage":
            $message = $mailbox->getMessage($id);
            if ($message->unread) {
                $mailbox->markMessageAsRead($id);
            }
            $output = $oJSON->encode($message);
            break;
        default:
            $output = "null";        
    }          
    
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
        <title>Ajax Mail Navigate</title>
    </head>
    <body>    
        <script type="text/javascript" src="./sea-modules/seajs/seajs/2.1.0/sea.js"></script>
        <script language="JavaScript" type="text/javascript">
        var oInfo = <?php echo $output ?>;
        seajs.config({
            base: "./sea-modules"
        })
        seajs.use("./Reconstruction1/AjaxMailNavigate")
        

        </script>
    </body>
</html>
   
