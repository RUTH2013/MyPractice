<template>
    <transition name="food">
        <div class="food" v-show="showFlag" ref="foodDetails">
            <div class="food-content">
                <div class="img-header">
                    <img :src="food.image" alt="">
                    <div class="back" @click="hide">
                        <i class="icon-arrow_lift"></i>
                    </div>
                </div>
                <div class="content">
                    <h1>{{food.name}}</h1>
                    <div class="extra">
                        <span>月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                    </div>
                    <div class="price">
                        ￥<span>{{food.price}}</span>
                        <span v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                    </div>
                    <div class="cart-btn">
                        <cartControl :food="food" v-show="food.count>0"></cartControl>
                    </div>
                    <div class="buy-cart" v-show="!food.count || food.count===0" @click.stop.prevent="addFood($event)">
                        加入购物车
                    </div>
                </div>
                <split v-show="food.info"></split>
                <div class="food-detail" v-show="food.info">
                    <h1>商品介绍</h1>
                    <p>{{food.info}}</p>
                </div>
                <split></split>
                <div class="food-rating">
                    <h1>商品评价</h1>
                    <ratingSelect :ratings="food.ratings"
                                  :select-type="selectType"
                                  :only-content="onlyContent"
                                  :desc="desc"
                                  v-on:rating-type="onRatingType"
                                  v-on:toggle-content="onToggleContent"></ratingSelect>
                    <div class="rating-wrap">
                        <ul v-show="food.ratings && food.ratings.length">
                            <li class="rating-item"
                                v-for="rating in food.ratings"
                                v-show="needShow(rating.rateType,rating.text)">
                                <span class="time">{{rating.rateTime | formatDate }}</span>
                                <p class="text">
                                    <i :class="{'icon-thumb_up':rating.rateType===0,'icon-thumb_down':rating.rateType===1}"></i>
                                    <span>{{rating.text}}</span>
                                </p>
                                <div class="user">
                                    <span>{{rating.username}}</span>
                                    <img :src="rating.avatar" alt="" width="12" height="12">
                                </div>
                            </li>
                        </ul>
                        <div class="no-rating" v-show="!food.ratings || !food.ratings.length">暂无评价！！！</div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import Vue from 'vue';
    import cartControl from '@/components/common/cartControl/cartControl';
    import ratingSelect from '@/components/common/ratingSelect/ratingSelect';
    import split from '@/components/common/split/split';
    import {formatDate} from '@/common/js/data';

    //    const POSITIVE = 0; // 推荐
    //    const NEGATIVE = 1; // 吐槽
    const ALL = 2; // 全部

    export default {
        props: {
            food: {
                type: Object
            }
        },
        data() {
            return {
                showFlag: false,
                selectType: ALL, // 评论的类型选项
                onlyContent: true, // 只看有内容的评价的选项
                desc: {
                    all: '全部',
                    positive: '推荐',
                    negative: '吐槽'
                }
            };
        },
        methods: {
            show() {
                this.showFlag = true;
                this.selectType = ALL;
                this.onlyContent = false;
                this.$nextTick(() => {
                    if (!this.scroll) {
                        this.scroll = new BScroll(this.$refs.foodDetails, {
                            click: true  // 设置 menu 可以点击
                        });
                    } else {
                        this.scroll.refresh();
                    }
                });
            },
            hide() {
                this.showFlag = false;
            },
            addFood(event) {
                if (!event._constructed) {
                    return;
                }
                if (!this.food.count) {
                    Vue.set(this.food, 'count', 1);
                } else {
                    this.food.count++;
                }
            },
            needShow(type, text) { // 评论内容的显示
                if (this.onlyContent && !text) {
                    return false;
                }
                if (this.selectType === ALL) {
                    return true;
                } else {
                    return type === this.selectType;
                }
            },
            onRatingType(val) { // 子组件
                this.selectType = val; // ④外层调用组件方注册变更方法，将组件内的数据变更，同步到组件外的数据状态中
                this.$nextTick(() => {
                    this.scroll.refresh();
                });
            },
            onToggleContent(val) {
                this.onlyContent = val; // ④外层调用组件方注册变更方法，将组件内的数据变更，同步到组件外的数据状态中
                this.$nextTick(() => {
                    this.scroll.refresh();
                });
            }
        },
        filters: {
            formatDate(time) {
                let date = new Date(time);
                return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
            }
        },
        components: {
            cartControl,
            split,
            ratingSelect
        }
    };
</script>

<style scoped lang="less" rel="stylesheet/less">
    @import "../../common/less/mixin";
    .food {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 48px;
        z-index: 30;
        width: 100%;
        background: #ffffff;
        transition: all 0.4s;
        &.food-enter-active, &.food-leave-active {
            transform: translate3d(100%, 0, 0);
        }
        .img-header {
            position: relative;
            width: 100%;
            height: 0;
            padding-top: 100%;
            img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            .back {
                position: absolute;
                top: 10px;
                left: 0;
                padding: 6px;
                i {
                    display: block;
                    padding: 12px;
                    font-size: 20px;
                    background: rgba(7, 17, 27, 0.2);
                    border-radius: 50%;
                    color: #ffffff;
                }
            }
        }
        .content {
            position: relative;
            padding: 18px;
            h1 {
                margin-bottom: 8px;
                line-height: 14px;
                font-size: 14px;
                font-weight: bold;
                color: rgb(7, 17, 27);
            }
            .extra {
                line-height: 10px;
                margin-bottom: 18px;
                height: 10px;
                font-size: 10px;
                color: rgb(147, 153, 159);
                span:first-child {
                    margin-right: 12px;
                }
            }
            .price {
                font-weight: 400;
                font-size: 10px;
                color: rgb(240, 20, 20);
                vertical-align: bottom;
                line-height: 20px;
                span:first-child {
                    margin-right: 18px;
                    font-size: 14px;
                }
                span:nth-child(2) {
                    text-decoration: line-through;
                    color: rgb(147, 153, 159);
                }
            }
        }
        .cart-btn {
            position: absolute;
            bottom: 12px;
            right: 12px;
        }
        .buy-cart {
            position: absolute;
            right: 18px;
            bottom: 18px;
            z-index: 10;
            height: 24px;
            line-height: 24px;
            padding: 0 12px;
            box-sizing: border-box;
            border-radius: 12px;
            font-size: 10px;
            background: rgb(0, 160, 220);
            color: #ffffff;
        }
        .food-detail, .food-rating {
            h1 {
                margin-bottom: 8px;
                line-height: 14px;
                font-size: 14px;
                color: rgb(7, 17, 27);
            }
        }
        .food-detail {
            padding: 18px;
            p {
                padding: 0 8px;
                line-height: 24px;
                font-size: 14px;
                color: rgb(77, 85, 93);
                text-align: justify;
            }
        }
        .food-rating {
            padding: 18px 0;
            h1 {
                padding: 0 18px;
            }
        }
        .rating-wrap {
            padding: 0 18px;
            .rating-item {
                position: relative;
                padding: 16px 0;
                color: rgb(147, 153, 159);
                .border-1(rgba(7, 17, 24, 0.1));
                &:last-child {
                    .border-none();
                }
                .time {
                    line-height: 12px;
                    font-size: 10px;
                }
                .text {
                    margin-top: 6px;
                    line-height: 16px;
                    font-size: 12px;
                    color: rgb(7, 17, 24);
                    .icon-thumb_up {
                        color: rgb(0, 160, 220);
                    }
                    .icon-thumb_down {
                        color: rgb(147, 153, 159);
                    }
                }
                .user {
                    position: absolute;
                    right: 0;
                    top: 16px;
                    font-size: 0;
                    line-height: 12px;
                    span {
                        font-size: 10px;
                        margin-right: 6px;
                        vertical-align: middle;
                    }
                    img {
                        border-radius: 50%;
                        vertical-align: middle;
                    }
                }
            }
            .no-rating {
                padding: 16px 0;
                font-size: 12px;
                color: rgb(147, 153, 159);
            }
        }
    }

</style>
