<template>
    <div class="cartControl">
        <transition name="move">
            <div class="decrease " v-show="food.count>0" @click.stop.prevent="decreaseCart($event)">
                <i class="icon-remove_circle_outline"></i>
            </div>
        </transition>
        <div class="count" v-show="food.count>0">{{food.count}}</div>
        <div class="add" @click.stop.prevent="addCart($event)">
            <i class="icon-add_circle"></i>
        </div>
    </div>

</template>

<script type="text/ecmascript-6">
    import Vue from 'vue';

    export default {
        props: {
            food: {
                type: Object
            }
        },
        methods: {
            addCart(event) {
                if (!event._constructed) {
                    return;
                }
                if (!this.food.count) {
                    Vue.set(this.food, 'count', 1);
                } else {
                    this.food.count++;
                }
                // this.$dispatch('cart.add', event.target); // 将dom 元素 保存到cart.add中
                this.$emit('add', event.target);
            },
            decreaseCart(event) {
                if (!event._constructed) {
                    return;
                }
                if (this.food.count) {
                    this.food.count--;
                }
            }
        }
    };
</script>

<style scoped lang="less" rel="stylesheet/less">
    .cartControl {
        font-size: 0;
        .decrease, .add {
            display: inline-block;
            padding: 0 6px;
            line-height: 24px;
            font-size: 24px;
            color: rgb(0, 160, 220);;
        }
        .decrease {
            transition: all 0.5s linear;
            &.move-enter-active, &.move-leave-active {
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
            &.move-enter, &.move-leave-to {
                opacity: 0;
                transform: translate3d(24px, 0, 0);
            }
        }
        .count {
            display: inline-block;
            vertical-align: top;
            width: 12px;
            padding-top: 6px;
            line-height: 12px;
            text-align: center;
            font-size: 10px;
            color: rgb(147, 153, 15,);
        }
    }

</style>
