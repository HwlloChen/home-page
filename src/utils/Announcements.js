/**
 * Announcements
 * 公告
 */

import { snackbar, dialog } from 'mdui';
import { MD5 } from "crypto-js";
import { globalVars } from './globalVars';
import { marked } from 'marked';

localStorage.getItem("readedAnnouncements") == null ? localStorage.setItem("readedAnnouncements", "[]") : null
let readedList = JSON.parse(localStorage.getItem("readedAnnouncements"))

/**
 * Displays announcements based on their importance levels (1-3).
 * Shows announcements using different UI components based on importance:
 * - Level 1: Simple snackbar notification
 * - Level 2: Snackbar with "Don't show again" option
 * - Level 3: Modal dialog with markdown support
 * 
 * Announcements older than 21 days are not displayed.
 * Previously acknowledged important announcements (level 2-3) are tracked in localStorage.
 * 
 * 根据重要性级别（1-3）显示公告。
 * 基于重要性使用不同的UI组件显示公告：
 * - 级别1：简单的snackbar通知
 * - 级别2：带有"不再显示"选项的snackbar
 * - 级别3：支持markdown的模态对话框
 * 
 * 超过21天的公告将不再显示。
 * 已确认的重要公告（级别2-3）会在localStorage中进行追踪。
 * 
 * @function
 * @name showAnnouncements
 * @global
 * @requires globalVars.announcements
 * @requires snackbar
 * @requires dialog
 * @requires marked
 * @requires MD5
 */
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

                    contentDiv.innerHTML = marked.parse(a.content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""))
                    contentDiv.className = "mdui-prose";
                    contentDiv.style = "margin-bottom: 10px; margin: 1rem 0; width: 100%; height: auto; overflow-x: hidden;"

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
    if (res.status != 200 || !data) {
        snackbar({
            message: "公告获取失败，请稍后再试",
            autoCloseDelay: 2500,
            closeOnOutsideClick: true,
            placement: 'bottom-start',
        })
        return
    }

    if (!Array.isArray(data) || data.length === 0) return

    data = data.sort((a, b) => { return a.importance < b.importance })
    globalVars.announcements = data

    showAnnouncements()
}