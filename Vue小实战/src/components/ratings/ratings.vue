<template>
    <div class="ratings" ref="ratingWrap">
        <div class="ratings-content">
            <div class="over-view">
                <div class="over-left">
                    <strong>{{seller.score}}</strong>
                    <h3>综合评分</h3>
                    <span>高于周边商家{{seller.rankRate}}%</span>
                </div>
                <div class="over-right">
                    <div class="score-wrap">
                        <span class="title">服务态度</span>
                        <star :size="36" :score="seller.serviceScore"></star>
                        <span class="score">{{seller.serviceScore}}</span>
                    </div>
                    <div class="score-wrap">
                        <span class="title">商品评分</span>
                        <star :size="36" :score="seller.foodScore"></star>
                        <span class="score">{{seller.foodScore}}</span>
                    </div>
                    <div class="score-wrap">
                        <span class="title">送达时间</span>
                        <span class="text">{{seller.deliveryTime}}分钟</span>
                    </div>
                </div>
            </div>
            <split></split>

            <ratingSelect :ratings="ratings"
                          :select-type="selectType"
                          :only-content="onlyContent"
                          :desc="desc"
                          v-on:rating-type="onRatingType"
                          v-on:toggle-content="onToggleContent"></ratingSelect>
            <ul class="ratings-wrap">
                <li class="rating-item"
                    v-for="rating in ratings"
                    v-show="needShow(rating.rateType,rating.text)">
                    <img class="avatar" width="28" height="28" :src="rating.avatar">
                    <div class="content">
                        <h1>{{rating.username}}</h1>
                        <div class="star-wrap">
                            <star :size="24" :score="rating.score"></star>
                            <span class="delivery" v-show="rating.deliveryTime">{{rating.deliveryTime}}分钟送达</span>
                        </div>
                        <span class="time">{{rating.rateTime | formatDate }}</span>
                        <p class="text">{{rating.text}}</p>
                        <div class="recommend">
                            <i :class="{'icon-thumb_up':rating.rateType===0,'icon-thumb_down':rating.rateType===1}"></i>
                            <span v-for="recommend in rating.recommend">{{recommend}}</span>
                        </div>
                    </div>
                </li>

            </ul>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import star from '@/components/common/star/star';
    import split from '@/components/common/split/split';
    import ratingSelect from '@/components/common/ratingSelect/ratingSelect';
    import {formatDate} from '@/common/js/data';

    const ALL = 2; // 全部
    const ERR_OK = 0; // 成功状态码
    export default {
        name: 'ratings',
        props: {
            seller: {
                type: Object
            }
        },
        data() {
            return {
                ratings: [],
                selectType: ALL, // 评论的类型选项
                onlyContent: true, // 只看有内容的评价的选项
                desc: {
                    all: '全部',
                    positive: '满意',
                    negative: '不满意'
                }
            };
        },
        methods: {
            _initScroll() { // 使用better-scroll设置滑动
                this.scroll = new BScroll(this.$refs.ratingWrap, {
                    click: true  // 设置 menu 可以点击
                });
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
        created() {
            this.$http.get('/api/ratings').then((response) => {
                response = response.body; // 取json对象
                if (response.erron === ERR_OK) {
                    this.ratings = response.data;
                    this.$nextTick(() => {  // 在这个函数中调用以防内容还未加载完就执行，获取不到元素的高度导致无法滑动
                        this._initScroll();
                    });
                }
            });
        },
        filters: {
            formatDate(time) {
                let date = new Date(time);
                return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
            }
        },
        components: {
            star,
            split,
            ratingSelect
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" rel="stylesheet/less">
    @import "../../common/less/mixin";
    .ratings {
        position: absolute;
        top: 174px;
        bottom: 0;
        left: 0;
        width: 100%;
        overflow: hidden;
    }
    .over-view {
        display: flex;
        padding: 18px 0;
        .over-left {
            flex: 0 0 137px;
            width: 137px;
            padding: 6px 0;
            text-align: center;
            border-right: 1px solid rgba(7, 17, 27, 0.2);
            @media only screen and (max-width: 320px) {
                flex: 0 0 120px;
                width: 120px;
            }

            strong {
                line-height: 28px;
                font-size: 24px;
                color: rgb(255, 153, 0);
            }
            h3 {
                margin: 6px 0 8px;
                line-height: 12px;
                font-size: 12px;
                color: rgb(7, 17, 27);
                font-weight: bold;
            }
            span {
                line-height: 10px;
                font-size: 10px;
                color: rgb(147, 153, 159);
            }
        }
        .over-right {
            flex: 1;
            padding: 6px 0 6px 24px;
            @media only screen and (max-width: 320px) {
                padding-left: 8px;
            }
            .score-wrap {
                margin-bottom: 8px;
                font-size: 0;
                .title {
                    display: inline-block;
                    vertical-align: top;
                    line-height: 18px;
                    font-size: 12px;
                    color: rgb(7, 17, 27);
                }
                .star {
                    display: inline-block;
                    vertical-align: top;
                    margin: 0 12px;
                    &.star-36 {
                        .star-item {
                            margin-right: 8px;
                        }
                    }
                    @media only screen and (max-width: 320px) {
                        margin: 0 6px;
                    }
                }
            }
            .score {
                display: inline-block;
                vertical-align: top;
                line-height: 18px;
                font-size: 12px;
                color: rgb(255, 153, 0);
            }
            .text {
                margin-left: 12px;
                line-height: 18px;
                font-size: 12px;
                color: rgb(147, 153, 159);
                @media only screen and (max-width: 320px) {
                    margin-left: 6px;
                }
            }
        }
    }
    .ratings-wrap {
        padding: 0 18px;
        .rating-item {
            display: flex;
            padding: 18px 0;
            .avatar {
                flex: 0 0 28px;
                width: 28px;
                margin-right: 12px;
                border-radius: 50%;
            }
            .content {
                flex: 1;
                position: relative;
                h1 {
                    margin-bottom: 4px;
                    line-height: 24px;
                    font-size: 10px;
                    color: rgb(7, 17, 27);
                }
                .star-wrap {
                    margin-bottom: 6px;
                    font-size: 0;
                    .star {
                        display: inline-block;
                        margin-right: 6px;
                        vertical-align: top;
                    }
                    .delivery {
                        line-height: 12px;
                        font-size: 10px;
                        color: rgb(147, 153, 159);
                    }
                }
                .time {
                    position: absolute;
                    top: 0;
                    right: 0;
                    line-height: 24px;
                    font-size: 10px;
                    color: rgb(147, 153, 159);
                }
                .text {
                    margin-bottom: 8px;
                    line-height: 16px;
                    font-size: 12px;
                    color: rgb(7, 17, 24);
                    text-align: justify;
                }
                .recommend {
                    line-height: 16px;
                    font-size: 0;
                    i {
                        display: inline-block;
                        font-size: 10px;
                        &.icon-thumb_up {
                            color: rgb(0, 160, 220);
                        }
                        &.icon-thumb_down {
                            color: rgb(147, 153, 159);
                        }
                    }
                    span {
                        display: inline-block;
                        padding: 0 6px;
                        margin-left: 8px;
                        border: 1px solid rgba(7, 17, 27, 0.1);
                        border-radius: 1px;
                        font-size: 10px;
                        color: rgb(147, 153, 159);
                    }
                }

            }
        }

    }
</style>
