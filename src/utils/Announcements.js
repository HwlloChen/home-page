/**
 * Announcements
 * 公告
 */

import { snackbar, dialog } from 'mdui';
import { MD5 } from "crypto-js";
import { globalVars } from './globalVars';

localStorage.getItem("readedAnnouncements") == null ? localStorage.setItem("readedAnnouncements", "[]") : null
let readedList = JSON.parse(localStorage.getItem("readedAnnouncements"))

function showAnnouncements() {
    // 按照优先级先后显示1~3级别的公告
    const l = globalVars.announcements.length
    let h = 0
    function showAnnouncement() {
        if (h < l) {
            const a = globalVars.announcements[h]
            if (new Date() - new Date(a.publishTime) > (1000 * 60 * 60 * 24) * 21) { // 21天前的公告不再显示
                h++
                showAnnouncement()
                return
            }
            if (a.importance <= 1) {
                snackbar({
                    message: a.content,
                    autoCloseDelay: 2500,
                    closeOnOutsideClick: true,
                    placement: 'bottom-start',
                })
                h++
                setTimeout(() => { showAnnouncement() }, 350)
            } else if (!readedList.includes(MD5(a.content + a.publisher + a.publishTime).toString())) {
                if (a.importance == 2) {
                    snackbar({
                        message: `<div class='iconsnackbar'><mdui-icon name=\"notifications\"></mdui-icon>${a.content}</div>`,
                        autoCloseDelay: 10000,
                        icon: 'notification-important',
                        action: "不再显示",
                        onActionClick: () => {
                            readedList.push(MD5(a.content + a.publisher + a.publishTime).toString())
                            localStorage.setItem("readedAnnouncements", JSON.stringify(readedList))
                        },
                        onClose: () => {
                            h++
                            showAnnouncement()
                        }
                    })
                } else {
                    const dialogBody = document.createElement('div')

                    const contentDiv = document.createElement('div');
                    contentDiv.textContent = a.content
                    contentDiv.style = "margin-bottom: 10px; margin: 1rem 0;"

                    const publisherDiv = document.createElement('div');
                    publisherDiv.innerHTML = `发布者：${a.publisher} <br>${new Date(a.publishTime).toLocaleString()}`;
                    publisherDiv.style = "text-align: right; color: #888; font-size: .85rem;"

                    dialogBody.appendChild(contentDiv);
                    dialogBody.appendChild(publisherDiv);
                    dialog({
                        headline: '重要公告',
                        body: dialogBody,
                        icon: 'announcement',
                        actions: [
                            {
                                text: '知道了',
                                onClick: () => {
                                    readedList.push(MD5(a.content + a.publisher + a.publishTime).toString())
                                    localStorage.setItem("readedAnnouncements", JSON.stringify(readedList))

                                    h++
                                    showAnnouncement()
                                }
                            }
                        ]
                    })
                }
            } else {
                h++
                showAnnouncement()
            }
        }
    }
    showAnnouncement()
}

export async function Announcements() {
    const res = await fetch(globalVars.site.backpoint + "/announcements")
    let data = await res.json()
    data = await data.sort((a, b) => { return a.importance < b.importance })
    globalVars.announcements = await data

    showAnnouncements()
}