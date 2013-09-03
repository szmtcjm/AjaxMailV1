define(function(require, exports, module) {
    var constant = require('./constant');
    var helperFun = require('./helperFunctions');
    require('./json');
    require('./zxml');
    require("../sea-modules/jquery/jquery-2.0.3.min.js");
    /**
     * The mailbox.
     */
    var oMailbox = {

        //-----------------------------------------------------
        // Properties
        //-----------------------------------------------------

        //folder-related information
        info: new Object(),   //information about the mail being displayed
        processing: false,    //determines if processing is taking place
        message: new Object(),//information about the current message
        nextNotice: null,    //information to be displayed to the user

        //-----------------------------------------------------
        // Data-Related Methods
        //-----------------------------------------------------

        /**
         * Moves a message to the trash.
         * @scope protected
         * @param sId The ID of the message.
         */
        deleteMessage: function (sId) {
            this.nextNotice = constant.string.sDeleteMailNotice;
            this.request("delete", loadAndRender, sId);
        },

        /**
         * Moves a message to the trash.
         * @scope protected
         * @param sId The ID of the message.
         */
        emptyTrash: function () {
            if (confirm(constant.string.sEmptyTrashConfirm)) {
                this.nextNotice = constant.string.sEmptyTrashNotice;
                if (this.info.folder == constant.folders.TRASH) {
                    this.request("empty", loadAndRender);
                } else {
                    this.request("empty", execute);
                }
            }
        },

        /**
         * Retrieves messages for the current folder and page.
         * @scope protected
         * @param iFolder The folder to retrieve.
         * @param iPage The page in that folder to retrieve.
         */
        getMessages: function (iFolder, iPage) {
            this.info.folder = iFolder;
            this.info.page = iPage;
            this.navigate("getfolder");
        },

        /**
         * Loads data from the server into the mailbox.
         * @scope protected
         * @param vInfo A JSON-encoded string containing mailbox information or an info object.
         */
        loadInfo: function (vInfo) {
            if (typeof vInfo == "string") {
                this.info = JSON.parse(vInfo);
            } else {
                this.info = vInfo;
            }
        },

        /**
         * Loads message data from the server into the mailbox.
         * @scope protected
         * @param vMessage A JSON-encoded string containing message information or a message object.
         */
        loadMessage: function (vMessage) {
            if (typeof vMessage == "string") {
                this.message = JSON.parse(vMessage);
            } else {
                this.message = vMessage;
            }
        },

        /**
         * Makes a request to the server.
         * @scope protected
         * @param sAction The action to perform.
         * @param fnCallback The function to call when the request completes.
         * @param sId The ID of the message to act on (optional).
         */
        navigate: function (sAction, sId) {
            if (this.processing) return;
            try {
                this.setProcessing(true);
                var sURL = constant.urls.sAjaxMailNavigateURL + "?folder=" +this.info.folder + "&page=" + this.info.page + "&action=" + sAction;
                if (sId) {
                    sURL += "&id=" + sId;

                }
                $("#iLoader").attr("src", sURL);
            } catch (oException) {
                this.showNotice("error", oException.message);
            }
        },

        /**
         * Retrieves messages for the next page in the current folder.
         * @scope protected
         * @param iFolder The folder to retrieve.
         * @param iPage The page in that folder to retrieve.
         */
        nextPage: function () {
            this.getMessages(this.info.folder, this.info.page+1);
        },

        /**
         * Retrieves messages for the previous page in the current folder.
         * @scope protected
         * @param iFolder The folder to retrieve.
         * @param iPage The page in that folder to retrieve.
         */
        prevPage: function () {
            this.getMessages(this.info.folder, this.info.page-1);
        },

        /**
         * Begins download of the given message.
         * @param sId The message ID to retrieve.
         */
        readMessage: function (sId) {
            this.navigate("getmessage", sId);
        },

        /**
         * Refreshes the current folder's view.
         * @scope protected
         * @param iFolder The ID of the new folder to refresh.
         */
        refreshFolder: function (iFolder) {
            this.info.folder = iFolder;
            this.info.page = 1;
            this.request("getfolder", loadAndRender);
        },

        /**
         * [request description]
         * @param  {[type]} aAction
         * @param  {[type]} fnCallback
         * @param  {[type]} sId
         * @return {[type]}
         */
        request: function (sAction, fnCallback, sId) {
            if(this.processing) return;
            this.setProcessing(true);
            var sURL = constant.urls.sAjaxMailURL + "?folder=" +this.info.folder + "&page=" + this.info.page + "&action=" + sAction;
            if (sId) {
                sURL += "&id=" + sId;
            }
            $.get(sURL, function(data, textStatus, jqXHR) {
                fnCallback(data);
            });

        },

        /**
         * Moves a message from the trash to the constant.folders.INBOX.
         * @scope protected
         * @param sId The ID of the message.
         */
        restoreMessage: function (sId) {
            this.nextNotice = constant.string.sRestoreMailNotice;
            this.request("restore", loadAndRender, sId);
        },

        /**
         * Makes a request to the server.
         * @scope protected
         * @param sAction The action to perform.
         * @param fnCallback The function to call when the request completes.
         * @param sId The ID of the message to act on (optional).
         */
        sendMail: function () {
            if (this.processing) return;
            $("#divComposeMailForm").hide();
            $("#divComposeMailStatus").show();

            this.setProcessing(true);
            var sData = helperFun.getRequestBody($("form").get(0));
            $.ajax({
                type: "POST",
                url: constant.urls.sAjaxMailSendURL,
                data: sData,
                success: sendConfirmation,
                dataType: "json"
            });
        },

        /**
         * Sets the UI to be enabled or disabled.
         * @scope protected
         * @param bProcessing True to enable, false to disable.
         */
        setProcessing: function (bProcessing) {
            this.processing = bProcessing;
            if(bProcessing) {
               $("#divFolderStatus").show(); 
           }else {
               $("#divFolderStatus").hide();
           }
        },

        /**
         * Switches the view to a new folder.
         * @scope protected
         * @param iNewFolder The ID of the new folder to switch to.
         */
        switchFolder: function (iNewFolder) {
            this.getMessages(iNewFolder, 1);
        },

        //-----------------------------------------------------
        // UI-Related Methods
        //-----------------------------------------------------

        /**
         * Cancels the reply and sends back to read mail view.
         * @scope protected
         */
        cancelReply: function () {
            history.go(-1);
        },

        compose: function () {
            this.navigate("compose");
        },

        displayCompose: function () {
            this.displayComposeMailForm("", "", "", "");
        },

        displayComposeMailForm: function (sTo, sCC, sSubject, sMessage) {
            $("#txtTo").val(sTo);
            $("#txtCC").val(sCC);
            $("#txtSubject").val(sSubject);
            $("#txtSubject").val(sSubject);
            $("#txtMessage").val(sMessage);

            $("#divReadMail").hide();
            $("#divComposeMail").show();
            $("#divFolder").hide();
            this.setProcessing(false);
        },

        displayFolder: function (oInfo) {
            this.loadInfo(oInfo);
            this.renderFolder();
            this.setProcessing(false);
        },

        displayForward: function () {
            this.displayComposeMailForm("", "",
                "Fwd: " + this.message.subject,
                "---------- Forwarded message ----------\n" + this.message.message);
        },

        displayMessage: function (oMessage) {
            this.loadMessage(oMessage);
            this.renderMessage();
            this.setProcessing(false);
        },

        displayReply: function () {
            var sTo = this.message.from;
            var sCC = "";

            this.displayComposeMailForm(sTo, sCC, "Re: " + this.message.subject,
                "\n\n\n\n\n" + this.message.from + "said: \n" + this.message.message);

        },

        displayReplyAll: function () {
            var sTo = this.message.from + "," + this.message.to;
            var sCC = this.message.cc;

            this.displayComposeMailForm(constant.string.sTo, sCC, "Re: " + this.message.subject,
                "\n\n\n\n\n" + this.message.from + "said: \n" + this.message.message);

        },

        forward: function () {
            this.navigate("forward");
        },

        /**
         * Initializes DOM pointers and other property values.
         * @scope protected
         */
        init: function () {
            /*var colAllElements = document.getElementsByTagName("*");
            if (colAllElements.length == 0) {
                colAllElements = document.all;
            }

            for (var i=0; i < colAllElements.length; i++) {
                if (colAllElements[i].id.length > 0) {
                    this[colAllElements[i].id] = colAllElements[i];
                }
            }*/
            //assign event handlers
            $("#imgPrev").click(function () {
                oMailbox.prevPage();
            });

            $("#imgNext").click(function () {
                oMailbox.nextPage();
            });

            $("#spnCompose").click(function () {
                oMailbox.compose();
            });

            $("#spnInbox").click(function () {
                if (oMailbox.info.folder == constant.folders.INBOX) {
                    oMailbox.refreshFolder(constant.folders.INBOX);
                } else {
                    oMailbox.switchFolder(constant.folders.INBOX);
                }
            });

            $("#spnTrash").click(function () {
                if (oMailbox.info.folder == constant.folders.TRASH) {
                    oMailbox.refreshFolder(constant.folders.TRASH);
                } else {
                    oMailbox.switchFolder(constant.folders.TRASH);
                }
            });
            $("#spnEmpty").click(function () {
                oMailbox.emptyTrash();
            });
            $("#spnReply").click(function () {
                oMailbox.reply(false);
            });
            $("#spnReplyAll").click(function () {
                oMailbox.reply(true);
            });
            $("#spnForward").click(function () {
                oMailbox.forward();
            });
            $("#spnCancel").click(function () {
                oMailbox.cancelReply();
            });
            $("#spnSend").click(function () {
                oMailbox.sendMail();
            });
            $("#aaddCC").click(function () {
                oMailbox.addCC();
            });
            $("#aremoveCC").click(function() {
                oMailbox.removeCC();
            });

            $("#aremoveCC").hide();
            $("#CC").hide();
        },

        /**
         * Initializes and loads the mailbox with the initial page.
         * @scope protected
         */
        load: function () {
            this.init();
            this.getMessages(constant.folders.INBOX, 1);
        },

        /**
         * Renders the messages on the screen.
         * @scope protected
         */
        renderFolder: function () {;
            var tblMain = this.tblMain;

            $("#tblMain").children("tBody").children().remove();
            //remove all child nodes
            /*while (tblMain.tBodies[0].hasChildNodes()) {
                tblMain.tBodies[0].removeChild(tblMain.tBodies[0].firstChild);
            }*/

            //create document fragment to store new DOM objects
            var oFragment = document.createDocumentFragment();

            //add a new row for each message
            if (this.info.messages.length) {
                for (var i=0; i < this.info.messages.length; i++) {
                    var oMessage = this.info.messages[i];
                    var oNewTR = this.trTemplate.cloneNode(true);
                    oNewTR.id = "tr" + oMessage.id;
                    oNewTR.onclick = readMessage;

                    if (oMessage.unread) {
                        oNewTR.className = "new";
                    }

                    var colCells = oNewTR.getElementsByTagName("td");
                    var imgAction = colCells[0].childNodes[0];
                    imgAction.id = oMessage.id;
                    if (this.info.folder == constant.folders.TRASH) {
                        imgAction.onclick = restoreMessage;
                        imgAction.src = constant.urls.sRestoreIcon;
                        imgAction.title = constant.string.sRestore;
                    } else {
                        imgAction.onclick = deleteMessage;
                        imgAction.src = constant.urls.sDeleteIcon;
                        imgAction.title = constant.string.sDelete;
                    }

                    colCells[1].appendChild(document.createTextNode(helperFun.cleanupEmail(oMessage.from)));
                    colCells[2].firstChild.style.visibility = oMessage.hasAttachments ? "visible" : "hidden";
                    colCells[3].appendChild(document.createTextNode(helperFun.htmlEncode(oMessage.subject)));
                    colCells[4].appendChild(document.createTextNode(oMessage.date));
                    oFragment.appendChild(oNewTR);
                }
            } else {
                var oNewTR = this.trNoMessages.cloneNode(true);
                oFragment.appendChild(oNewTR);
            }

            //add the message rows
            tblMain.tBodies[0].appendChild(oFragment);

            //only change folder name if it's different
            if (this.hFolderTitle.innerHTML != constant.folders.aFolders[this.info.folder]) {
                this.hFolderTitle.innerHTML = constant.folders.aFolders[this.info.folder];
            }

            //update unread message count for Inbox
            this.updateUnreadCount(this.info.unreadCount);

            //set up the message count (hide if there are no messages)
            this.spnItems.style.visibility = this.info.messages.length ? "visible" : "hidden";
            this.spnItems.innerHTML = this.info.firstMessage + "-" + (this.info.firstMessage + this.info.messages.length - 1) + " of " + this.info.messageCount;

            //determine show/hide of pagination images
            if (this.info.pageCount > 1) {
                this.imgNext.style.visibility = this.info.page < this.info.pageCount ? "visible" : "hidden";
                this.imgPrev.style.visibility = this.info.page > 1 ? "visible" : "hidden";
            } else {
                this.imgNext.style.visibility = "hidden";
                this.imgPrev.style.visibility = "hidden";
            }

            this.divFolder.style.display = "block";
            this.divReadMail.style.display = "none";
            this.divComposeMail.style.display = "none";
        },

        renderMessage: function () {
            this.hSubject.innerHTML = helperFun.htmlEncode(this.message.subject);
            this.divMessageFrom.innerHTML = constant.string.sFrom + " " + helperFun.htmlEncode(this.message.from);
            this.divMessageTo.innerHTML = constant.string.sTo + " " + helperFun.htmlEncode(this.message.to);
            this.divMessageCC.innerHTML = this.message.cc.length ? constant.string.sCC + " " + helperFun.htmlEncode(this.message.cc) : "";
            this.divMessageBCC.innerHTML = this.message.bcc.length ? constant.string.sBCC + " " + helperFun.htmlEncode(this.message.bcc) : "";
            this.divMessageDate.innerHTML = this.message.date;
            this.divMessageBody.innerHTML = this.message.message;

            if (this.message.hasAttachments) {
                this.ulAttachments.style.display = "";

                var oFragment = document.createDocumentFragment();

                for (var i=0; i < this.message.attachments.length; i++) {
                    var oLI = document.createElement("li");
                    oLI.className = "attachment";
                    oLI.innerHTML = "<a href=\"" + constant.urls.sAjaxMailAttachmentURL + "?id=" + this.message.attachments[i].id + "\" target=\"_blank\">" + this.message.attachments[i].filename + "</a> (" + this.message.attachments[i].size + ")";
                    oFragment.appendChild(oLI);
                }

                this.ulAttachments.appendChild(oFragment);
                this.liAttachments.style.display = "";
            } else {
                this.ulAttachments.style.display = "none";
                this.liAttachments.style.display = "none";
                this.ulAttachments.innerHTML = "";
            }

            this.updateUnreadCount(this.message.unreadCount);
            this.divFolder.style.display = "none";
            this.divReadMail.style.display = "block";
            this.divComposeMail.style.display = "none";
        },

        /**
         * Sets up the screen to reply to an e-mail.
         * @scope protected
         * @param blnAll Set to true for "reply to all"
         */
        reply: function (blnAll) {
            this.navigate("reply" + (blnAll ? "all" : ""));
        },

        /**
         * Shows a message on the screen.
         * @scope protected
         * @param sType The type of message to display.
         * @param sMessage The message to display.
         */
        showNotice: function (sType, sMessage) {
            var $divNotice = $("#divNotice");
            $divNotice.addClass(sType);
            $divNotice.text(sMessage);
            $divNotice.show();
            setTimeout(function () {
                $divNotice.hide();
            }, constant.iShowNoticeTime);
        },

        /**
         * Updates the count of unread messages displayed on
         * the screen.
         * @scope protected
         * @param iCount The number of unread messages.
         */
        updateUnreadCount: function (iCount) {
            $("#spnUnreadMail").text(iCount > 0 ? " (" + iCount + ")" : "");
        },

        /**
         * [addCC description]
         */
        addCC: function () {
           $("#CC").show();
           $("#aaddCC").hide();
           $("#aremoveCC").show();
        },

        /**
         * [removeCC description]
         * @return {[type]}
         */
        removeCC: function () {
            $("#CC").hide();
            $("#aremoveCC").hide();
            $("#aaddCC").show();
        }
        
    };

    /*-------------------------------------------------------
     * Callback Functions
     *-------------------------------------------------------*/

    /**
     * Callback function to execute a client-server request and display
     * a notification about the result.
     * @scope protected.
     * @param sInfo The information returned from the server.
     */
    function execute(sInfo) {
        if (oMailbox.nextNotice) {
            oMailbox.showNotice("info", oMailbox.nextNotice);
            oMailbox.nextNotice = null;
        }
        oMailbox.setProcessing(false);
    }

    /**
     * Callback function to execute a client-server request and then
     * load and display new mail information.
     * @scope protected.
     * @param sInfo The information returned from the server.
     */
    function loadAndRender(sInfo) {

        oMailbox.loadInfo(sInfo);
        oMailbox.renderFolder();

        if (oMailbox.nextNotice) {
            oMailbox.showNotice("info", oMailbox.nextNotice);
            oMailbox.nextNotice = null;
        }
        oMailbox.setProcessing(false);
    }

    /**
     * The callback function when attempting to send an e-mail.
     * @scope protected
     * @param sData The data returned from the server.
     */
    function sendConfirmation(sData) {
        if (sData.error) {
            alert("An error occurred:\n" + sData.message);
        } else {
            oMailbox.showNotice("info", sData.message);
            $("#divComposeMail").hide();
            $("#divReadMail").hide();
            $("#divFolder").show();
        }
        $("#divComposeMailForm").show();
        $("#divComposeMailStatus").hide();
        oMailbox.setProcessing(false);
    }

    /**
     * [readMessage description]
     * @return {[type]}
     */
    function readMessage() {
        oMailbox.readMessage(this.id.substring(2));
    }
    /**
     * [deleteMessage description]
     * @return {[type]}
     */
    function deleteMessage() {
        oMailbox.deleteMessage(this.id);
    }
    /**
     * [restoreMessage description]
     * @return {[type]}
     */
    function restoreMessage() {
        oMailbox.restoreMessage(this.id);
    }

    module.exports = oMailbox;
});