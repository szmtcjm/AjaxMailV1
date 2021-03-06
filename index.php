<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
        <title>Ajax Mail</title>
        <link rel="stylesheet" type="text/css" href="styles/AjaxMail.css" />

    </head>
    <body>       
        <ul id="ulMainMenu">
            <li id="liCompose"><span class="link" id="spnCompose">Compose Mail</span></li>
            <li><span class="link" id="spnInbox">Inbox<span id="spnUnreadMail"></span></span></li>
            <li><span class="link" id="spnTrash">Trash</span> (<span class="link" id="spnEmpty">Empty</span>)</li>
        </ul>
        <div id="divNotice"></div>
        <div id="divFolder">            
            <div id="divFolderHeader" class="header">
                 <h1 id="hFolderTitle">Inbox</h1>
                 <div id="divFolderStatus" class="status">Loading...</div>
                 <div id="divItemCount"><img src="images/btn_prev.gif" alt="Previous Page" title="Previous Page" id="imgPrev" /><span id="spnItems"></span><img src="images/btn_next.gif" alt="Next Page" title="Next Page" id="imgNext" /></div>
            </div>
            <table border="0" cellpadding="0" cellspacing="0" id="tblMain">
                <thead>
                    <tr id="trTemplate">
                        <td><img src="images/icon_delete.gif" /></td>
                        <td class="from"></td>
                        <td class="attachment"><img src="images/icon_attachment.gif" title="Attachment" /></td>
                        <td class="subject"></td>
                        <td class="date" nowrap="nowrap"></td>
                    </tr>       
                    <tr id="trNoMessages">
                        <td colspan="5">There are no messages in this folder.</td>
                    </tr>         
                </thead>
                <tbody>
                    <tr style="visibility: hidden">
                        <td colspan="5"></td>
                    </tr>                    
                </tbody>
            </table>
        </div>  
        <div id="divReadMail" style="display: none">
            <div class="header">
                 <h1 id="hSubject"></h1>
            </div>
             <div class="message-headers">
                 <div id="divMessageFrom"></div>
                 <div id="divMessageDate"></div>
             </div>    
             <div id="divMessageTo"></div>
             <div id="divMessageCC"></div>    
             <div id="divMessageBCC"></div>
             <ul class="message-actions">
                 <li><span class="link" id="spnReply">Reply</span></li>
                 <li><span class="link" id="spnReplyAll">Reply All</span></li>
                 <li><span class="link" id="spnForward">Forward</span></li>  
                 <li id="liAttachments"><a href="#attachments">View Attachments</a></li>                                              
             </ul>             
            <div id="divMessageBody"></div>
            <a name="attachments" id="aAttachments">Attachments</a>
            <div id="divMessageAttachments">
                <ul id="ulAttachments">
                </ul>
            </div>

        </div>        
               
        <div id="divComposeMail" style="display: none">
            <div class="header">
                 <h1 id="hComposeHeader">Compose Mail</h1>
            </div>
            <div id="divComposeMailForm">
             <ul id="ulComposeActions" class="message-actions">
                 <li><span class="link" id="spnSend">Send</span></li>
                 <li><span class="link" id="spnCancel">Cancel</span></li>                
             </ul>             
             <div id="divComposeBody">
                 <form method="post" name="frmSendMail">
                     <table border="0" cellpadding="0" cellspacing="0">
                         <tr>
                             <td class="field-label-container"><label for="txtTo" class="field-label">To:</label></td>
                             <td class="field-container"><textarea rows="2" cols="30" id="txtTo" name="txtTo" class="form-field"></textarea></td>
                         </tr>
                         <tr>
                             <td class="field-label-container"><label for="txtCC" class="field-label">CC:</label></td>
                             <td class="field-container"><textarea rows="2" cols="30" id="txtCC" name="txtCC" class="form-field"></textarea></td>
                         </tr>
                         <a href="javascript:void(0)" onclick="addCC();">add CC</a>
                         <tr>
                             <td class="field-label-container"><label for="txtSubject" class="field-label">Subject:</label></td>
                             <td class="field-container"><input type="text" id="txtSubject" name="txtSubject"  class="form-field" /></td>
                         </tr>
                         <tr>
                             <td class="message-container" colspan="2"><textarea id="txtMessage" name="txtMessage" rows="15" cols="30" class="form-field"></textarea></td>
                         </tr>
                     </table>
                 </form>             
             </div>
             </div>
             <div id="divComposeMailStatus" style="display: none">
                 <h2>Sending...</h2>
                 <img src="images/sendmail.gif" />
             </div>
        </div>                
        <iframe id="iLoader" src="about:blank"></iframe>
    </body>
    <script type="text/javascript" src="./sea-modules/seajs/seajs/2.1.0/sea.js"></script>
    <script type="text/javascript">
        seajs.config({
            base: "sea-modules/",
            alias: {
                "jquery": "./sea-modules/jquery/jquery/1.10.1/jquery.js",
            }
        });
        seajs.use('./Reconstruction1/main');
    </script>
</html>