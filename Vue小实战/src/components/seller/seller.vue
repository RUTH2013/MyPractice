<template>
    <div class="seller" ref="sellerWrap">
        <div class="seller-content">
            <div class="over-view">
                <h1>{{seller.name}}</h1>
                <div class="desc border-1px">
                    <star :size="36" :score="seller.score"></star>
                    <span class="text">({{seller.ratingCount}})</span>
                    <span class="text">月售{{seller.sellCount}}单</span>
                </div>
                <ul class="remark">
                    <li class="block">
                        <h2>起送价</h2>
                        <p><strong>{{seller.minPrice}}</strong>元</p>
                    </li>
                    <li class="block">
                        <h2>商家配送</h2>
                        <p><strong>{{seller.deliveryPrice}}</strong>元</p>
                    </li>
                    <li class="block">
                        <h2>平均配送时间</h2>
                        <p><strong>{{seller.deliveryTime}}</strong>分钟</p>
                    </li>
                </ul>
                <div class="favorite" @click="toggleFavorite($event)">
                    <i class="icon-favorite" :class="{'current': favorite }"></i>
                    <span class="text">{{favoriteText}}</span>
                </div>
            </div>
            <split></split>
            <div class="bulletin">
                <h1>公告与活动</h1>
                <p class="content border-1px">{{seller.bulletin}}</p>
                <ul class="supports" v-if="seller.supports">
                    <li class="support-item  border-1px" v-for="item in seller.supports">
                        <span class="icon" :class="classMap[item.type]"></span>
                        <span class="text">{{item.description}}</span>
                    </li>
                </ul>
            </div>
            <split></split>
            <div class="seller-pics">
                <h1>商家实景</h1>
                <div class="pic-wrap" ref="picWrap">
                    <ul ref="picList">
                        <li class="pic-item" v-for="pic in seller.pics">
                            <img :src="pic" width="120" height="90" alt="">
                        </li>
                    </ul>
                </div>
            </div>
            <split></split>
            <div class="seller-info">
                <h1>商家信息</h1>
                <ul>
                    <li class="info-item" v-for="info in seller.infos">{{info}}</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import star from '@/components/common/star/star';
    import split from '@/components/common/split/split';
    import {saveToLocal, loadFromLocal} from '@/common/js/storage';

    export default {
        name: 'seller',
        props: {
            seller: {
                type: Object
            }
        },
        data() {
            return {
                favorite: (() => {
                    return loadFromLocal(this.seller.id, 'favorite', false);
                })()
            };
        },
        computed: {
            favoriteText() {
                return this.favorite ? '已收藏' : '收藏';
            }
        },
        methods: {
            _initScroll() { // 使用better-scroll设置滑动
                if (!this.scroll) {
                    this.scroll = new BScroll(this.$refs.sellerWrap, {
                        click: true  // 设置 menu 可以点击
                    });
                } else {
                    this.scroll.refresh();
                }
            },
            _initPic() {
                if (this.seller.pics) { // 计算pic ul的宽度
                    let picWidth = 120;
                    let margin = 6;
                    let padding = 18;
                    let width = (picWidth + margin) * this.seller.pics.length - margin + 2 * padding;
                    this.$refs.picList.style.width = `${width}px`;
                    this.$nextTick(() => {  // 在这个函数中调用以防内容还未加载完就执行
                        if (!this.picScroll) {
                            this.picScroll = new BScroll(this.$refs.picWrap, {
                                scrollX: true,
                                eventPassthrough: 'vertical'  // 水平滑动
                            });
                        } else {
                            this.picScroll.refresh();
                        }
                    });
                }
            },
            toggleFavorite(event) {
                if (!event._constructed) {
                    return;
                }
                this.favorite = !this.favorite;
                saveToLocal(this.seller.id, 'favorite', this.favorite);
            }
        },
        created() {
            this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
        },
        mounted() {
            this.$nextTick(() => {  // 在这个函数中调用以防内容还未加载完就执行
                this._initScroll();
                this._initPic();
            });
        },
        watch: {
            seller() {
                this.$nextTick(() => {  // 在这个函数中调用以防内容还未加载完就执行
                    this._initScroll();
                    this._initPic();
                });
            }
        },
        components: {
            star,
            split
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" rel="stylesheet/less">
    @import "../../common/less/mixin";
    .seller {
        position: absolute;
        top: 174px;
        bottom: 0;
        left: 0;
        width: 100%;
        overflow: hidden;
        h1 {
            margin-bottom: 8px;
            line-height: 14px;
            font-size: 14px;
            font-weight: bold;
            color: rgb(7, 17, 27);
        }
    }
    .over-view {
        position: relative;
        padding: 18px;
        .desc {
            padding-bottom: 18px;
            .border-1(rgba(7, 17, 27, 0.1));
            font-size: 0;
            .star {
                display: inline-block;
                margin-right: 8px;
                vertical-align: top;
            }
            .text {
                display: inline-block;
                margin-right: 12px;
                line-height: 18px;
                vertical-align: top;
                font-size: 10px;
                color: rgb(77, 85, 93);
            }
        }
        .remark {
            display: flex;
            padding-top: 18px;
            .block {
                flex: 1;
                text-align: center;
                border-right: 1px solid rgba(7, 17, 27, 0.1);
                &:last-child {
                    border-right: none;
                }
                h2 {
                    margin-bottom: 4px;
                    line-height: 10px;
                    font-size: 10px;
                    color: rgb(147, 153, 159);
                }
                p {
                    line-height: 24px;
                    font-size: 10px;
                    color: rgb(77, 85, 93);
                    vertical-align: text-bottom;
                    strong {
                        font-size: 24px;
                        font-weight: 200;
                        color: rgb(7, 17, 27);
                    }
                }
            }
        }
        .favorite {
            position: absolute;
            right: 18px;
            top: 18px;
            width: 40px;
            text-align: center;
            i {
                display: block;
                line-height: 24px;
                font-size: 24px;
                color: #d4d6d9;
                &.current {
                    color: rgb(240, 20, 20);
                }
            }
            span {
                line-height: 10px;
                font-size: 10px;
                color: rgb(77, 85, 93);
            }
        }
    }
    .bulletin {
        padding: 18px 18px 0;
        p {
            padding: 0 12px 18px;
            line-height: 24px;
            font-size: 12px;
            color: rgb(240, 20, 20);
            text-align: justify;
            .border-1(rgba(7, 17, 27, 0.1));
        }
        .supports {
            .support-item {
                padding: 16px 12px;
                line-height: 16px;
                .border-1(rgba(7, 17, 27, 0.1));
                font-size: 12px;
                color: rgb(7, 17, 27);
                &:last-child {
                    .border-none();
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
                        .bg-img('seller/assets/decrease_4');
                    }
                    &.discount {
                        .bg-img('seller/assets/discount_4');
                    }
                    &.guarantee {
                        .bg-img('seller/assets/guarantee_4');
                    }
                    &.invoice {
                        .bg-img('seller/assets/invoice_4');
                    }
                    &.special {
                        .bg-img('seller/assets/special_4');
                    }
                }
            }
        }
    }
    .seller-pics {
        padding: 18px 0;
        h1 {
            padding-left: 18px;
        }
        .pic-wrap {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            ul {
                font-size: 0;
                margin: 0 18px;
            }
            .pic-item {
                display: inline-block;
                margin-right: 6px;
                width: 120px;
                height: 90px;
                &:last-child {
                    margin-right: 0;
                }
            }
        }
    }
    .seller-info {
        padding: 18px 18px 0;
        h1 {
            padding-bottom: 8px;
            margin-bottom: 0;
            .border-1(rgba(7, 17, 27, 0.1));
        }
        .info-item {
            padding: 16px 12px;
            line-height: 16px;
            .border-1(rgba(7, 17, 27, 0.1));
            font-size: 12px;
            color: rgb(7, 17, 27);
            &:last-child {
                .border-none();
            }
        }
    }

</style>
