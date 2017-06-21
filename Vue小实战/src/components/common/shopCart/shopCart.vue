<template>
    <div class="shopCart">
        <div class="content" @click="toggleList">
            <div class="content-left">
                <div class="logo-wrap">
                    <div class="logo" :class="{'highlight':totalCount > 0}">
                        <i class="icon-shopping_cart"></i>
                    </div>
                    <div class="count" v-show="totalCount>0">{{totalCount}}</div>
                </div>
                <div class="price" :class="{'highlight':totalPrice > 0}">￥{{totalPrice}}</div>
                <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
            </div>
            <div class="content-right" @click.stop.prevent="pay">
                <div class="pay" :class="payClass">
                    {{payDesc}}
                </div>
            </div>
        </div>
        <div class="ball-wrap">
            <transition-group name="ball">
                <div v-for="(ball,index) in balls" v-show="ball.show" :key="index" class="ball">
                    <div class="inner inner-hook"></div>
                </div>
            </transition-group>
        </div>
        <transition name="fold">
            <div class="cart-list" v-show="listShow">
                <div class="list-header">
                    <h1>购物车</h1>
                    <span class="empty" @click="empty">清空</span>
                </div>
                <div class="list-content" ref="listCart">
                    <ul>
                        <li class="food" v-for="food in selectFoods">
                            <span class="name">{{food.name}}</span>
                            <div class="price">
                                <span>￥{{food.price*food.count}}</span>
                            </div>
                            <div class="cart-btn">
                                <cartControl :food="food"></cartControl>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
        <transition name="mask">
            <div class="list-mask" v-show="listShow" @click="hideList"></div>
        </transition>
    </div>


</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import cartControl from '@/components/common/cartControl/cartControl';
    export default {
        props: {
            deliveryPrice: {
                type: Number,
                default: 0
            },
            minPrice: {
                type: Number,
                default: 0
            },
            selectFoods: {
                type: Array,
                default() {
                    return [
                        {
                            price: 10,
                            count: 2
                        }
                    ];
                }
            }
        },
        data() {
            return {
                balls: [
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    }
                ],
                dropBall: [],
                fold: true
            };
        },
        computed: {
            totalPrice() {
                let total = 0;
                this.selectFoods.forEach((food) => {
                    total += food.price * food.count;
                });
                return total;
            },
            totalCount() {
                let count = 0;
                this.selectFoods.forEach((food) => {
                    count += food.count;
                });
                return count;
            },
            payDesc() {
                if (this.totalPrice === 0) {
                    return `￥${this.minPrice}起送`;
                } else if (this.totalPrice < this.minPrice) {
                    let money = this.minPrice - this.totalPrice;
                    return `还差￥${money}起送`;
                } else {
                    return '去结算';
                }
            },
            payClass() {
                if (this.totalPrice >= this.minPrice) {
                    return 'enough';
                }
            },
            listShow() {
                if (!this.totalCount) {
                    this.fold = true;
                    return false;
                }
                let isShow = !this.fold;
                if (isShow) {
                    this.$nextTick(() => {  // 在这个函数中调用以防内容还未加载完就执行，获取不到元素的高度导致无法滑动
                        if (!this.scroll) {
                            this.scroll = new BScroll(this.$refs.listCart, {
                                click: true  // 设置 menu 可以点击
                            });
                        } else {
                            this.scroll.refresh();
                        }
                    });
                }
                return isShow;
            }
        },
        methods: {
            drop(el) {
                for (let i = 0; i < this.balls.length; i++) {
                    let ball = this.balls[i];
                    if (!ball.show) {
                        ball.el = el;
                        this.dropBall.push(ball);
                        return;
                    }
                }
            },
            toggleList() {
                if (!this.totalCount) {
                    return;
                }
                this.fold = !this.fold;
            },
            empty() {
                this.selectFoods.forEach((food) => {
                    food.count = 0;
                });
            },
            hideList() {
                this.fold = true;
            },
            pay() { // 结算
                if (this.totalPrice < this.minPrice) {
                    return;
                }
                window.alert(`支付${this.totalPrice}元`);
            }
        },
        components: {
            cartControl
        }
    };
</script>

<style scoped lang="less" rel="stylesheet/less">
    @import "../../../common/less/mixin";
    .shopCart {
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 50;
        width: 100%;
        height: 48px;
    }
    .content {
        display: flex;
        background: #141a27;
    }
    .content-left {
        flex: 1;
        font-size: 0;
        color: rgba(255, 255, 255, 0.4);
        .logo-wrap {
            display: inline-block;
            position: relative;
            top: -10px;
            margin: 0 12px;
            width: 56px;
            height: 56px;
            box-sizing: border-box;
            padding: 6px;
            border-radius: 50%;
            vertical-align: top;
            background: #141a27;
        }
        .logo {
            width: 100%;
            height: 100%;
            text-align: center;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            i {
                line-height: 44px;
                font-size: 24px;
            }
            &.highlight {
                background: rgb(0, 160, 220);
                i {
                    color: #ffffff;
                }
            }
        }
        .count {
            position: absolute;
            top: 0;
            right: 0;
            width: 24px;
            height: 16px;
            line-height: 16px;
            text-align: center;
            border-radius: 16px;
            font-size: 9px;
            font-weight: bold;
            color: #ffffff;
            background: rgb(240, 20, 20);
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
        }
        .price, .desc {
            display: inline-block;
            vertical-align: top;
            margin-top: 12px;
            line-height: 24px;
            box-sizing: border-box;
        }
        .price {
            padding-right: 12px;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 16px;
            font-weight: bold;
            &.highlight {
                color: #ffffff;
            }
        }
        .desc {
            margin-left: 12px;
            font-size: 10px;
        }
    }
    .content-right {
        flex: 0 0 105px;
        width: 105px;
        .pay {
            height: 48px;
            line-height: 48px;
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.4);
            font-size: 12px;
            font-weight: bold;
            &.enough {
                background: #00b43c;
                color: #ffffff;
            }
        }
    }
    .ball-wrap {
        .ball {
            position: fixed;
            left: 32px;
            bottom: 22px;
            z-index: 200;
            .inner {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: rgb(0, 160, 220);
                transition: all 0.4s;
            }
        }
    }
    .cart-list {
        position: absolute;
        bottom: 48px;
        left: 0;
        z-index: -1;
        width: 100%;
        transition: all 0.5s;
        &.fold-enter-active, &.fold-leave-active {
            transform: translate3d(0, 100%, 0);
        }
        .list-header {
            height: 40px;
            line-height: 40px;
            padding: 0 18px;
            background: #f3f5f7;
            border-bottom: 1px solid rgba(7, 17, 27, .1);
            h1 {
                float: left;
                font-size: 14px;
                color: rgb(7, 17, 27);
                font-weight: bold;
            }
            span {
                float: right;
                font-size: 12px;
                color: rgb(0, 160, 220);
            }
        }
        .list-content {
            padding: 0 18px;
            max-height: 217px;
            overflow: hidden;
            background: #ffffff;
            .food {
                position: relative;
                padding: 12px 0;
                height: 48px;
                box-sizing: border-box;
                .border-1(rgba(7, 17, 27, .1));
            }
            .name {
                line-height: 24px;
                font-size: 14px;
                color: rgb(7, 17, 27);
            }
            .price {
                position: absolute;
                right: 90px;
                bottom: 12px;
                line-height: 24px;
                font-size: 14px;
                font-weight: bold;
                color: rgb(240, 20, 20);
            }
            .cart-btn {
                position: absolute;
                right: 0;
                bottom: 8px;
            }
        }
    }
    .list-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.6);
        z-index: -2;
        backdrop-filter: blur(10px);
        transition: all 0.5s;
        &.mask-enter-active, &.mask-leave-active {
            opacity: 1;
        }
        &.mask-enter, &.mask-leave-to {
            opacity: 0;
        }
    }

</style>
