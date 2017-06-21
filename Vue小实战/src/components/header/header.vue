<template>
    <div class="header">
        <div class="content-wrap">
            <div class="avatar">
                <img width="64" height="64" :src="seller.avatar" alt="头像"/>
            </div>
            <div class="content">
                <div class="title">
                    <span class="brand"></span>
                    <span class="name">{{seller.name}}</span>
                </div>
                <div class="description">
                    {{seller.description}} / {{seller.deliveryTime}}分钟送达
                </div>
                <div class="supports" v-if="seller.supports">
                    <span class="icon" :class="classMap[seller.supports[0].type]"></span>
                    <span class="text">{{seller.supports[0].description}}</span>
                </div>
            </div>
            <div class="support-count" v-if="seller.supports" @click="showDetail">
                <span class="count">{{seller.supports.length}}个</span>
                <span class="icon-keyboard_arrow_right"></span>
            </div>
        </div>
        <div class="bulletin-warp" @click="showDetail">
            <span class="text">{{seller.bulletin}}</span>
            <span class="icon-keyboard_arrow_right"></span>
        </div>
        <div class="head-bg">
            <img width="100%" :src="seller.avatar"/>
        </div>
        <transition name="fade">
            <div class="detail" v-show="detailShow">
                <div class="detail-warp clearfix">
                    <div class="detail-main">
                        <h1 class="name">{{seller.name}}</h1>
                        <div class="star-warp">
                            <star :size="48" :score="seller.score"></star>
                        </div>
                        <div class="title">
                            <div class="line"></div>
                            <div class="text">优惠信息</div>
                            <div class="line"></div>
                        </div>
                        <ul class="supports" v-if="seller.supports">
                            <li class="support-item" v-for="item in seller.supports">
                                <span class="icon" :class="classMap[item.type]"></span>
                                <span class="text">{{item.description}}</span>
                            </li>
                        </ul>

                        <div class="title">
                            <div class="line"></div>
                            <div class="text">商家公告</div>
                            <div class="line"></div>
                        </div>
                        <p class="bulletin-text">{{seller.bulletin}}</p>
                    </div>
                </div>
                <div class="detail-close" @click="hideDetail">
                    <i class="icon-close"></i>
                </div>

            </div>
        </transition>
    </div>
</template>

<script type="text/ecmascript-6">
    import star from '@/components/common/star/star';
    export default {
        name: 'header',
        props: {
            seller: {
                type: Object
            }
        },
        data() {
            return {
                detailShow: false
            };
        },
        methods: {
            showDetail() {
                this.detailShow = true;
            },
            hideDetail() {
                this.detailShow = false;
            }
        },
        created() {
            this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
        },
        components: {
            star
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" rel="stylesheet/less">
    @import "../../common/less/mixin";
    .header {
        color: #ffffff;
        position: relative;
        overflow: hidden;
        background: rgba(7, 17, 27, 0.5);
    }
    .content-wrap {
        position: relative;
        padding: 24px 12px 18px 24px;
        font-size: 0;
        .avatar {
            display: inline-block;
            vertical-align: top;
            img {
                border-radius: 2px;
            }
        }
        .content {
            display: inline-block;
            margin-left: 16px;
            .title {
                margin: 2px 0 8px 0;
                font-size: 0;
            }
            .brand {
                display: inline-block;
                vertical-align: top;
                width: 30px;
                height: 18px;
                background: no-repeat center;
                .bg-img("header/assets/brand");
                background-size: 30px 18px;
            }
            .name {
                margin-left: 6px;
                font-size: 16px;
                line-height: 18px;
                font-weight: bold;
            }
            .description {
                margin-bottom: 10px;
                line-height: 12px;
                font-size: 12px;
            }
            .supports {
                .icon {
                    display: inline-block;
                    vertical-align: top;
                    width: 12px;
                    height: 12px;
                    margin-right: 4px;
                    background: no-repeat center;
                    background-size: 12px 12px;
                    &.decrease {
                        .bg-img('header/assets/decrease_1');
                    }
                    &.discount {
                        .bg-img('header/assets/discount_1');
                    }
                    &.guarantee {
                        .bg-img('header/assets/guarantee_1');
                    }
                    &.invoice {
                        .bg-img('header/assets/invoice_1');
                    }
                    &.special {
                        .bg-img('header/assets/special_1');
                    }
                }
                .text {
                    line-height: 12px;
                    font-size: 10px;
                }

            }
        }
        .support-count {
            position: absolute;
            right: 12px;
            bottom: 14px;
            padding: 0 8px;
            height: 24px;
            line-height: 24px;
            border-radius: 14px;
            background: rgba(0, 0, 0, 0.2);
            text-align: center;
            font-size: 0;
            .count {
                font-size: 10px;
                vertical-align: top;
                margin-right: 2px;
            }
            .icon-keyboard_arrow_right {
                font-size: 10px;
                line-height: 24px;
            }
        }
    }
    .bulletin-warp {
        position: relative;
        height: 28px;
        line-height: 28px;
        padding: 0 20px 0 34px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background: rgba(7, 17, 27, 0.2) no-repeat 12px center;
        background-size: 22px 12px;
        .bg-img('header/assets/bulletin');
        .text {
            margin: 0 4px;
            font-size: 10px;
        }
        .icon-keyboard_arrow_right {
            position: absolute;
            right: 12px;
            font-size: 10px;
            line-height: 28px;
        }
    }
    .head-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background: gray;
        overflow: hidden;
        filter: blur(10px);
    }
    .detail {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100;
        width: 100%;
        height: 100%;
        overflow: auto;
        transition: all 0.5s ease;
        background: rgba(7, 17, 27, 0.8);
        backdrop-filter: blur(10px);
        &.fade-enter-active, &.fade-leave-active {
            opacity: 1;
        }
        &.fade-enter, &.fade-leave-active {
            opacity: 0;
        }
        .detail-warp {
            width: 100%;
            min-height: 100%;
        }
        .detail-main {
            margin-top: 64px;
            padding-bottom: 64px;
            .name {
                text-align: center;
                line-height: 16px;
                font-size: 16px;
                font-weight: 400;
            }
            .star-warp {
                margin-top: 18px;
                padding: 2px 0;
                text-align: center;
            }
            .title {
                display: flex;
                width: 80%;
                margin: 30px auto 24px;
                .text {
                    padding: 0 12px;
                    font-size: 14px;
                    font-weight: 400;
                }
                .line {
                    flex: 1;
                    position: relative;
                    top: -6px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }
            }
            .supports {
                width: 80%;
                margin: 0 auto;
                .support-item {
                    padding: 0 12px;
                    margin-bottom: 12px;
                    font-size: 0;
                    &:last-child {
                        margin-bottom: 0;
                    }
                }
                .icon {
                    display: inline-block;
                    vertical-align: top;
                    width: 16px;
                    height: 16px;
                    margin-right: 6px;
                    background: no-repeat center;
                    background-size: 16px 16px;
                    &.decrease {
                        .bg-img('header/assets/decrease_2');
                    }
                    &.discount {
                        .bg-img('header/assets/discount_2');
                    }
                    &.guarantee {
                        .bg-img('header/assets/guarantee_2');
                    }
                    &.invoice {
                        .bg-img('header/assets/invoice_2');
                    }
                    &.special {
                        .bg-img('header/assets/special_2');
                    }
                }
                .text {
                    line-height: 16px;
                    font-size: 12px;
                }
            }
            .bulletin-text {
                width: 80%;
                margin: 0 auto;
                text-align: justify;
                font-size: 12px;
                line-height: 24px;
            }
        }
        .detail-close {
            position: relative;
            width: 32px;
            height: 32px;
            margin: -64px auto 0;
            clear: both;
            font-size: 32px;
        }
    }
</style>
