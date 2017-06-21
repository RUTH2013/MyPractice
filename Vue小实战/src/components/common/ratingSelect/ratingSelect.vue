<template>
    <div class="rating-select">
        <div class="rating-type border-1px">
            <span class="positive" :class="{'active':mySelectType===2}"
                  @click="selectEvent(2,$event)">{{desc.all}}<i>{{ratings.length}}</i></span>
            <span class="positive" :class="{'active':mySelectType===0}"
                  @click="selectEvent(0,$event)">{{desc.positive}}<i>{{positiveNum.length}}</i></span>
            <span class="negative" :class="{'active':mySelectType===1}"
                  @click="selectEvent(1,$event)">{{desc.negative}}<i>{{negativeNum.length}}</i></span>
        </div>
        <div class="switch">
            <i class="icon-check_circle" :class="{'current':myOnlyContent}" @click="toggleContent($event)"></i>
            <span>只看有内容的评价</span>
        </div>
    </div>

</template>

<script type="text/ecmascript-6">

    const POSITIVE = 0; // 推荐
    const NEGATIVE = 1; // 吐槽
    const ALL = 2; // 全部

    export default {
        props: {
            ratings: {
                type: Array,
                default() {
                    return [];
                }
            },
            selectType: {
                type: Number,
                default: ALL
            },
            onlyContent: {
                type: Boolean,
                default: false
            },
            desc: {
                type: Object,
                default() {
                    return {
                        all: '全部',
                        positive: '推荐',
                        negative: '吐槽'
                    };
                }
            }
        },
        data() {
            return {
                mySelectType: this.selectType,
                myOnlyContent: this.onlyContent
            };
        },
        methods: {
            selectEvent(type, event) {
                if (!event._constructed) {
                    return;
                }
                this.mySelectType = type;
            },
            toggleContent(event) {
                if (!event._constructed) {
                    return;
                }
                this.myOnlyContent = !this.myOnlyContent;
            }
        },
        computed: {
            positiveNum() {
                return this.ratings.filter((rating) => {  // 过滤  rating.rateType === POSITIVE 的数据
                    return rating.rateType === POSITIVE;
                });
            },
            negativeNum() {
                return this.ratings.filter((rating) => {
                    return rating.rateType === NEGATIVE;
                });
            },
            select() {
                return this.selectType;
            }
        },
        watch: {
            selectType(val) {
                this.mySelectType = val;// 新增result的watch，监听变更并同步到myResult上
            },
            mySelectType(val) {
                this.$emit('rating-type', val);// 组件内对myResult变更后向外部发送事件通知
            },
            onlyContent(val) {
                this.myOnlyContent = val;// 新增result的watch，监听变更并同步到myResult上
            },
            myOnlyContent(val) {
                this.$emit('toggle-content', val); // 组件内对myResult变更后向外部发送事件通知
            }
        }

    };
</script>

<style scoped lang="less" rel="stylesheet/less">
    @import "../../../common/less/mixin";
    .rating-select {
    }
    .rating-type {
        padding: 12px 0 18px;
        margin: 0 18px;
        .border-1(rgba(7, 17, 24, 0.1));
        font-size: 0;
        span {
            display: inline-block;
            padding: 8px 12px;
            margin-right: 8px;
            border-radius: 1px;
            color: rgb(77, 85, 93);
            font-size: 12px;
            line-height: 12px;
            vertical-align: top;
            &.active {
                color: #ffffff;
            }
            &.positive {
                background: rgba(0, 160, 220, 0.2);
                &.active {
                    background: rgb(0, 160, 220);
                }
            }
            &.negative {
                background: rgba(77, 85, 93, 0.2);
                &.active {
                    background: rgb(77, 85, 93);
                }
            }
            i {
                margin-left: 2px;
                line-height: 12px;
                font-size: 8px;
                font-style: normal;
            }
        }
    }
    .switch {
        padding: 12px 18px;
        line-height: 24px;
        font-size: 0;
        color: rgb(147, 153, 159);
        border-bottom: 1px solid rgba(7, 17, 24, 0.1);
        i {
            margin-right: 4px;
            font-size: 24px;
            vertical-align: middle;
            &.current {
                color: rgb(0, 160, 220);
            }
        }
        span {
            font-size: 12px;
            vertical-align: middle;
        }
    }

</style>
