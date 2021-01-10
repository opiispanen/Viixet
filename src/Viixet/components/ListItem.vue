<template>
<li class="itemlist__item" 
	:class="{ 
		'has-image': !!image || checkSlot('image'),
		'selected': stateSelected
	}">
	<div class="image"
		v-if="!!image"
		:style="{ 'background-image': 'url(' + image + ')' }">
	</div>
	<div class="image-element" v-if="checkSlot('image')">
		<slot name="image"></slot>
	</div>
	<div class="content">
		<slot></slot>
	</div>
	<div class="buttons" v-if="checkSlot('buttons') && !selectionEnabled">
		<slot name="buttons"></slot>
	</div>
	<div
		class="selection"
		v-if="selectionEnabled"
		@click="toggleSelect">
		<div class="selection__selected bg-primary-dark"></div>
	</div>
	<div class="itemlist__accordion-content" v-if="checkSlot('description')">
		<slot name="description"></slot>
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
		image: {
			type: String,
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
	},
	data: () => ({
		stateSelected: false,
	}),
	methods: {
		checkSlot: function (slotname) {
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

		const content = this.$el;

		if (this.checkSlot("buttons")) {
			let buttons = this.$el.querySelector(".buttons"),
				buttonsBounding = buttons.getBoundingClientRect();

			content.style.paddingRight = "calc([width]px + 0.5em)".replace(
				"[width]",
				buttonsBounding.width
			);
		}
	},
};
</script>

<style lang="scss">
.itemlist {

    .itemlist__item {
        display: block;
        min-height: 3.5em;
        position: relative;
		border-bottom: 1px solid #c4c4c4;
		padding: 0.75em;

        .content {
			font-size: .85em;
			
			h1, h2, h3, h4, h5, h6, p {
				margin: 0 0 .5em 0;
			}
        }

        .image, .image-element {
            position:absolute;
            width: 2.5em;
            height: 2.5em;
            top: .75em;
			left: .75em;
		}
		
		.image-element {
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

		.image {
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center; 
            border-radius: 100%;
		}

        .buttons {
            position: absolute;
            top: 0.5em;
            right: 0.3em;
            line-height: 2.25em;
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

    .itemlist__item.has-image {
        padding-left: 4em;
    }
}
</style>