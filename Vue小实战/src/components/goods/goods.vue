<template>
    <div class="goods">
        <div class="menu-wrap" ref="menuWrap">
            <ul>
                <li v-for="(item,index) in goods" class="menu-item" :class="{ 'current': currentIndex === index }"
                    @click="selectMenu(index,$event)">
                    <span class="text border-1px">
                        <span class="icon" v-if="item.type>0" :class="classMap[item.type]"></span>
                        {{item.name}}
                    </span>
                </li>
            </ul>
        </div>
        <div class="foods-wrap" ref="foodsWrap">
            <ul>
                <li class="food-list food-list-hook" v-for="(item,index) in goods" >
                    <h1>{{item.name}}</h1>
                    <ul>
                        <li class="food-item border-1px" v-for="food in item.foods" @click="selectOneFood(food, $event)">
                            <img class="icon" :src="food.icon" alt="">
                            <div class="content">
                                <h2>{{food.name}}</h2>
                                <p class="desc">{{food.description}}</p>
                                <div class="extra">
                                    <span>月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                                </div>
                                <div class="price">
                                    ￥<span>{{food.price}}</span>
                                    <span v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                                </div>
                                <div class="cart-btn">
                                    <cartControl :food="food" v-on:add="addCartEvent"></cartControl>
                                </div>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <shopCart ref="shopcart" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice"
                  :select-foods="selectFoods"></shopCart>
        <food ref="foodDetail" :food="selectedFood"></food>
    </div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import shopCart from '@/components/common/shopCart/shopCart';
    import cartControl from '@/components/common/cartControl/cartControl';
    import food from '@/components/goods/food';

    const ERR_OK = 0; // 成功状态码
    export default {
        name: 'goods',
        props: {
            seller: {
                type: Object
            }
        },
        data() {
            return {
                goods: [],
                listHeight: [], // 每个li food 列表到底部的距离
                scrollY: 0,  // 计算滑动的距离
                selectedFood: {}
            };
        },
        computed: {
            currentIndex() {
                for (let i = 0; i < this.listHeight.length; i++) {
                    let height1 = this.listHeight[i];
                    let height2 = this.listHeight[i + 1];
                    if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
                        return i;
                    }
                }
                return 0;
            },
            selectFoods() {
                let foods = [];
                this.goods.forEach((good) => {
                    good.foods.forEach((food) => {
                        if (food.count) {
                            foods.push(food);
                        }
                    });
                });
                return foods;
            }
        },
        methods: {
            _initScroll() { // 使用better-scroll设置滑动
                this.menuScroll = new BScroll(this.$refs.menuWrap, {
                    click: true  // 设置 menu 可以点击
                });
                this.foodsScroll = new BScroll(this.$refs.foodsWrap, {
                    probeType: 3,  // 设置获得滑动的位置
                    click: true  // 设置 food 可以点击
                });
                this.foodsScroll.on('scroll', (pos) => {
                    this.scrollY = Math.abs(Math.round(pos.y)); // 获得滑动的位置
                });
            },
            _calculateHeight() { // 计算 foods 列表的高度 数组
                let foodList = this.$refs.foodsWrap.getElementsByClassName('food-list-hook');  // 获得li
                let height = 0;
                this.listHeight.push(height);
                for (let i = 0; i < foodList.length; i++) {
                    let item = foodList[i];
                    height += item.clientHeight;
                    this.listHeight.push(height);
                }
            },
            selectMenu(index, event) {  // menu 点击选中右侧food
                if (!event._constructed) {
                    return;
                }
                let foodList = this.$refs.foodsWrap.getElementsByClassName('food-list-hook');  // 获得li
                let foodEl = foodList[index];
                this.foodsScroll.scrollToElement(foodEl, 300); // 滚动
            },
            addCartEvent(target) {
                this.$nextTick(() => {
                    this.$refs.shopcart.drop(target);
                });
            },
            selectOneFood(food, event) {
                if (!event._constructed) {
                    return;
                }
                this.selectedFood = food;
                this.$refs.foodDetail.show();
            }
        },
        created() {
            this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
            this.$http.get('/api/goods').then((response) => {
                response = response.body; // 取json对象
                if (response.erron === ERR_OK) {
                    this.goods = response.data;
                    this.$nextTick(() => {  // 在这个函数中调用以防内容还未加载完就执行，获取不到元素的高度导致无法滑动
                        this._initScroll();
                        this._calculateHeight();
                    });
                }
            });
        },
        components: {
            shopCart,
            cartControl,
            food
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" rel="stylesheet/less">
    @import "../../common/less/mixin";
    .goods {
        display: flex;
        position: absolute;
        top: 174px;
        bottom: 46px;
        width: 100%;
        overflow: hidden;
    }
    .menu-wrap {
        flex: 0 0 80px;
        width: 80px;
        background: #f3f5f7;
        .menu-item {
            display: table;
            width: 56px;
            height: 54px;
            line-height: 14px;
            padding: 0 12px;
            color: rgb(7, 17, 27);
            &.current {
                position: relative;
                z-index: 10;
                margin-top: -1px;
                background: #ffffff;
                font-weight: 400;
                color: rgb(0, 0, 0);
                .text {
                    .border-none();
                }
            }
            .icon {
                display: inline-block;
                vertical-align: top;
                width: 12px;
                height: 12px;
                margin-right: 2px;
                background: no-repeat center;
                background-size: 12px 12px;
                &.decrease {
                    .bg-img('goods/assets/decrease_3');
                }
                &.discount {
                    .bg-img('goods/assets/discount_3');
                }
                &.guarantee {
                    .bg-img('goods/assets/guarantee_3');
                }
                &.invoice {
                    .bg-img('goods/assets/invoice_3');
                }
                &.special {
                    .bg-img('goods/assets/special_3');
                }
            }
            .text {
                display: table-cell;
                width: 56px;
                vertical-align: middle;
                .border-1(rgba(7, 17, 27, 0.1));
                font-size: 12px;
                line-height: 14px;
            }

        }
    }
    .foods-wrap {
        flex: 1;
    }
    .food-list {
        h1 {
            padding: 0 0 0 14px;
            height: 26px;
            line-height: 26px;
            border-left: 2px solid #d9dde1;
            font-size: 12px;
            color: rgb(147, 153, 159);
            background: #f3f5f7;
        }
        .food-item {
            display: flex;
            margin: 0 18px;
            padding: 18px 0;
            .border-1(rgba(7, 17, 27, 0.1));
            &:last-child {
                .border-none();
            }
            .icon {
                flex: 0 0 57px;
                width: 57px;
                height: 57px;
                margin-right: 10px;
            }
            .content {
                flex: 1;
                h2 {
                    margin: 2px 0 4px;
                    line-height: 14px;
                    font-size: 14px;
                    color: rgb(7, 17, 27);
                }
                .desc, .extra {
                    line-height: 18px;
                    font-size: 10px;
                    color: rgb(147, 153, 159);
                }
                .desc {
                    line-height: 12px;
                    margin: 8px 0 4px;
                }
                .extra {
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
                .cart-btn {
                    position: absolute;
                    right: 0;
                    bottom: 12px;
                }
            }
        }
    }

</style>
