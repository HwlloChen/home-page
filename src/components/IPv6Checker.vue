<template>
    <mdui-tooltip :content="tip" placement="bottom-end">
        <mdui-chip id="ipchip" target="_blank" icon="question_mark">
            {{ info }}
        </mdui-chip>
    </mdui-tooltip>
</template>

<script setup>
import { $ } from 'mdui/jq.js';
import { onMounted, ref } from 'vue';
import { globalVars } from '@/utils/globalVars';

const info = ref('未知IP状态')
const tip = ref("？？？？？")

const testUrl = `${globalVars.backpoint_v6}/get_ip`

const getIP = () => {
    info.value = '正在检测您的IP地址'
    $('#ipchip').attr('loading', '')
    $('#ipchip').removeAttr('icon')
    $('#ipchip').removeAttr('href')

    $.ajax({
        url: testUrl,
        success: function (response) {
            $('#ipchip').attr('href', `https://ipw.cn/ipv6/?ip=${response}`)
            $('#ipchip').removeAttr('loading')
            info.value = `拥有IPv6地址`
            $('#ipchip').attr('icon', 'done')
            tip.value = `您拥有IPv6, 可以正常使用所有服务!  IPv6地址: ${response}`

        },
        error: function (xhr, status, e) {
            console.log(xhr, status, e)
            fetch('https://api6.ipify.org', { method: 'GET' })
                .then(response => {
                    if (response.ok) {
                        info.value = `ChenServer服务异常！`
                        $('#ipchip').removeAttr('loading')
                        $('#ipchip').attr('icon', 'warning')
                        tip.value = "看来是ChenServer的IPv6部分出现了问题呢  您可以及时反馈问题给我们(hwllochen@qq.com)"
                        $('#ipchip').attr("href", "mailto:hwllochen@qq.com")
                    } else {
                        info.value = `无IPv6地址`
                        $('#ipchip').removeAttr('loading')
                        $('#ipchip').attr('icon', 'error')
                        tip.value = "您没有IPv6地址，这将意味着您无法使用ChenServer的大部分功能！  点击查看如何开启IPv6(前往ipw.cn)"
                        $('#ipchip').attr("href", "https://ipw.cn/doc/ipv6/user/enable_ipv6.html")
                    }
                })
                .catch(error => {
                    info.value = `无IPv6地址`
                    $('#ipchip').removeAttr('loading')
                    $('#ipchip').attr('icon', 'error')
                    tip.value = "您没有IPv6地址，这将意味着您无法使用ChenServer的大部分功能！  点击查看如何开启IPv6(前往ipw.cn)"
                    $('#ipchip').attr("href", "https://ipw.cn/doc/ipv6/user/enable_ipv6.html")
                });
        }
    })
}

onMounted(getIP)
</script>

<style lang="less" scoped>
/* 针对手机设备 */
@media (max-width: 600px) {
    mdui-chip, mdui-tooltip {
        display: none;
    }
}

/* 针对平板电脑 */
@media (min-width: 601px) and (max-width: 1080px) {
    mdui-chip {
        margin-left: 3px;
        margin-right: 3px;
    }
}

/* 针对电脑 */
@media (min-width: 1081px) {
    mdui-chip {
        margin-left: 6px;
        margin-right: 6px;
    }
}

.glass {
    mdui-chip {
        background-color: rgba(var(--mdui-color-surface-container), 0.1);
    }
}
</style>