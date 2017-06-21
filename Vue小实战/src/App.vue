<template>
    <div id="app">
        <div class="header">
            <v-header :seller="seller"></v-header>
        </div>
        <div class="tab border-1px">
            <div class="tab-item">
                <router-link to="/goods">商品</router-link>
            </div>
            <div class="tab-item">
                <router-link to="/ratings">评论</router-link>

            </div>
            <div class="tab-item">
                <router-link to="/seller">商家</router-link>
            </div>
        </div>
        <keep-alive>
            <router-view :seller="seller"></router-view>
        </keep-alive>
    </div>
</template>

<script type="text/ecmascript-6">
    import header from '@/components/header/header.vue';
    import {urlParse} from '@/common/js/util';

    const ERR_OK = 0; // 成功状态码

    export default {
        name: 'app',
        data() {
            return {
                seller: {
                    id: (() => {
                        let queryParam = urlParse();
                        return queryParam.id;
                    })()
                }
            };
        },
        created() {
            this.$http.get('/api/seller?id=' + this.seller.id).then((response) => {
                response = response.body; // 取json对象
                if (response.erron === ERR_OK) {
                    // this.seller = response.data;
                    this.seller = Object.assign({}, this.seller, response.data);
                }
                console.log(this.seller.id);
            });
        },
        components: {
            'v-header': header
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    @import "./common/less/mixin";
    .tab {
        display: flex;
        width: 100%;
        height: 40px;
        line-height: 40px;
        .border-1(rgba(7, 17, 27, 0.1));
        .tab-item {
            flex: 1;
            text-align: center;
            a {
                display: block;
                font-size: 14px;
                color: rgb(77, 85, 93);
                &.active {
                    color: rgb(240, 20, 20);
                }
            }

        }
    }
</style>
