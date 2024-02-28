// ==UserScript==
// @name         勞資不想看到你個sb
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  通過網頁操作, 達成屏蔽與解除屏蔽使用者
// @author       You
// @match        *://jandan.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jandan.net
// @grant        none
// ==/UserScript==

(function () {
    //定義unban函式
    function unban(e) {
        // 獲取 li 元素
        var li = e.parentNode.parentNode.parentNode;
        var total = li.getElementsByClassName("author")[0].getElementsByTagName("strong")[0]
        // 獲取作者姓名
        var author = total.textContent;
        // 獲取防偽碼
        var privCode = total.getAttribute('title').split('防伪码：').pop();

        // 確認是否解除屏蔽
        if (confirm("讓我看看 " + author + " 這傢夥有什麼長進")) {
            // 從 localStorage 中刪除 banCodeObj 對象中 author.textContent 對應的鍵值對
            const banCodeObj = JSON.parse(localStorage.getItem('banCode'));
            if (banCodeObj[author]) {
                delete banCodeObj[author];
                localStorage.setItem('banCode', JSON.stringify(banCodeObj));
                location.reload();
            }
        }
        location.reload();
    }

    // 定義 ban() 函式
    function ban(e) {
        var li = e.parentNode.parentNode.parentNode;
        var author = li.getElementsByClassName("author")[0].getElementsByTagName("strong")[0];
        var privCode = $(author).attr('title').split('防伪码：').pop();
        if (confirm("您確定要屏蔽 " + author.textContent + " 嗎？")) {
            const banCodeObj = JSON.parse(localStorage.getItem('banCode'));
            banCodeObj[author.textContent] = privCode;
            localStorage.setItem('banCode', JSON.stringify(banCodeObj));
            location.reload();
        }
    }

    // tooltip觸發
    function showTooltip() {
        // 定義 Tooltip 變數
        var Tooltip = "This is a tooltip.";
      
        // 使用 Tooltip 變數
        console.log(Tooltip);
      }

    localStorage.getItem('banCode') == undefined ? localStorage.setItem('banCode', '{}') : console.log('Here is who you ban: ' + localStorage.getItem('banCode'))
    var banCode = JSON.parse(localStorage.getItem('banCode'))
    var banCodeKeys = Object.keys(banCode).length;
    var comment = document.getElementsByClassName("commentlist");
    var lis = comment[0].getElementsByTagName("li");

    // 定義屏蔽按鈕
    var voteElements = document.querySelectorAll(".jandan-vote");

    // 屏蔽防偽碼標記用戶
    for (var i = lis.length - 1; i >= 0; --i) {
        var author = lis[i].getElementsByClassName("author")[0].getElementsByTagName("strong")[0];
        for (var j = 0; j < banCodeKeys; ++j) {
            var name = $(author)[0].innerHTML;
            var privCode = $(author).attr('title').split('防伪码：').pop();
            if (privCode === Object.entries(banCode)[j][1]) {
                var contentBox = lis[i].getElementsByClassName("text")
                var content = $(contentBox).find('p:not(.bad_content)')[0].innerHTML.split('<br>').join()
                lis[i].getElementsByClassName("text")[0].innerHTML = `<del style="display: inline-block; margin-bottom: 20px; margin-top: 7px; margin-right: 5px;">${name} - 已屏蔽</del><i title="${content}" style="display: inline-block; font-size: 10px; ">偷看一下(鼠標懸停)</i>`;
                break
            }
        }
    }

    // 遍歷所有 .jandan-vote 元素
    for (var x = 0; x < voteElements.length; x++) {
        var button = document.createElement("a");


        if (row[x].innerHTML.includes('del')) {
            button.textContent = "[解除屏蔽]";
            button.addEventListener("click", function () {
                unban(this);
            });
        } else {
            button.textContent = "[屏蔽]";
            button.addEventListener("click", function () {
                ban(this);
            });
        }

        button.style.color = "#c8c7cc";
        voteElements[x].prepend(button);
    }

})();