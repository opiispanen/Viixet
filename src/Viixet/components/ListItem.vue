<template>
<li class="itemlist__item" 
	:class="{ 
		'selected': stateSelected
	}">
	<div style="display:flex;">
		<div v-if="checkSlot('image') || checkSlot('information')"
			class="item-sidecontent">
			<div class="image-element" 
				v-if="checkSlot('image')">
				<slot name="image"></slot>
			</div>
			<div class="item-information" v-if="checkSlot('information')">
				<slot name="information"></slot>
			</div>
		</div>
		<div style="flex-grow: 1;">
			<div class="primary-layer">
				<div class="content">
					<slot></slot>
				</div>
				<div class="item-timestamp" v-if="checkSlot('timestamp')">
					<slot name="timestamp"></slot>
				</div>
				<div
					class="selection" 
					v-if="selectionEnabled"
					@click="toggleSelect">
					<div class="selection__selected bg-primary-dark"></div>
				</div>
				<i v-if="moveEnabled && !selectionEnabled" class="fa fa-arrows-alt move-anchor"></i>
			</div>
			<div class="secondary-layer">
				<div class="" v-if="checkSlot('description')">
					<slot name="description"></slot>
				</div>
				
				<!-- stats slot -->
			</div>
		</div>
	</div>
	<div class="terniary-layer" v-if="checkSlot('buttons')">
		<div class="buttons">
			<slot name="buttons"></slot>
		</div>
	</div>
</li>
</template>

<script>
export default {
	name: "ListItem",
	props: {
		id: {
			required: false,
		},
		selectionEnabled: {
			type: Boolean,
			required: false,
			default: false,
		},
		selected: {
			type: Boolean,
			required: false,
			default: false,
		},
		moveEnabled: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data: () => ({
		stateSelected: false,
	}),
	methods: {
		checkSlot(slotname) {
			return !!this.$slots[slotname];
		},
		toggleSelect() {
			const oldValue = this.stateSelected;

			this.stateSelected = !oldValue;
			this.$emit('selected', { 
				id: this.id, 
				value: this.stateSelected,
				cancel: (overRide = null) => {
					this.stateSelected = overRide !== null ? overRide : oldValue;
				}
			});
		},
	},
	mounted() {
		this.stateSelected = !!this.selected;
	},
};
</script>

<style lang="scss" scoped>
.itemlist {
	.itemlist__item.card {
		padding: 0;
	}

    .itemlist__item {
        display: block;
        min-height: 3.5em;
        position: relative;
		border-bottom: 1px solid #c4c4c4;
		padding: 0.75em;

		.primary-layer {
			padding: .75em;
		}

		.secondary-layer {

		}

		.terniary-layer {
			display: flex;
			flex-direction: row-reverse;
			background: #f5f5f5;
			border-top: 1px solid #e6e6e6;
			
			button,
			.button {
				color: #4d4d4d;
			}
		}

		.primary-layer.has-image,
		.secondary-layer.has-image {
			padding-left: 4em;
		}

        .content {
			font-size: .85em;
			
			p {
				margin: 0 !important;
			}

			h1, h2, h3, h4, h5, h6, p {
				margin: 0 0 .5em 0;
			}
        }

		.item-sidecontent {
			width: 4em;
			padding: .75em;
		}

		.item-information {
			font-size: 10px;
			color: #666;
			padding-top: .75em;
			text-align: center;
		}

        .image, .image-element {
            width: 2.5em;
            height: 2.5em;
			margin: auto;
			/*
            position:absolute;
            top: .75em;
			left: .75em;
			*/
		}
		
		.image-element {
			img {
				width: 100%;
			}
			i.fa {
				display: block;
				border-radius: 100%;
				height: 100%;
				background: #333;
				color: #fff;
				text-align: center;
				line-height: 2.5em;
			}
		}

        .buttons {
			/*
            position: absolute;
            top: 0.5em;
            right: 0.3em;
            line-height: 2.25em;
			*/
			display: inline-flex;
			flex-direction: row;
        }

		.move-anchor {
			position: absolute;
			top: 0;
			right: 0;
			font-size: 1.5em;
			color: #bfbfbf;
			padding: .5em;
		}

		.selection {
			position: absolute;
			top: 0.75em;
			right: 0.5em;
			width: 2em;
			height: 2em;
			background: #cdcdcd;
			color: #555;
			text-align: center;
			padding: 0.25em;
			border-radius: 50%;
			transition: background 0.15s ease-out, color 0.4s ease-in;
			user-select: none;

			.selection__selected {
				width: 100%;
				height: 100%;
				border-radius: 50%;
				transition: transform 0.1s ease-in;
				transform: scale(0);
			}
		}
    }

	.itemlist__item.selected {
		.selection {
			.selection__selected {
				transform: scale(1);
			}
		}
	}

    .itemlist__item:last-of-type {
        border-bottom: none;
    }
}
</style>