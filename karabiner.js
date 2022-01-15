#!/usr/bin/env node

/*
 * Format with: prettier --write karabiner.js
 * Run with: node karabiner.js > karabiner.json
 *
 * Github: https://github.com/wincent/wincent/blob/dacc6dd68be840f4aa1b1138c388f9ef27eb42a3/roles/dotfiles/support/karabiner.js
 * Youtube: https://www.youtube.com/watch?v=DINWg9X8MNg
 *
 * SpaceFN: https://geekhack.org/index.php?topic=51069.0
 */

function keyCode(keyCode) {
  return {
    key_code: keyCode,
  };
}

function consumerKeyCode(keyCode) {
  return {
    consumer_key_code: keyCode,
  };
}

function appleVendorKeyCode(keyCode) {
  return {
    apple_vendor_keyboard_key_code: keyCode,
  };
}

function fromTo(from, to) {
  return {
    from: {
      ...from,
    },
    to: {
      ...to,
    },
  };
}

function spaceFN(from, to) {
  return [
    {
      from: {
        modifiers: {
          optional: ["any"],
        },
        simultaneous: [
          {
            key_code: "spacebar",
          },
          {
            ...from,
          },
        ],
        simultaneous_options: {
          key_down_order: "strict",
          key_up_order: "strict_inverse",
          to_after_key_up: [
            {
              set_variable: {
                name: "SpaceFN",
                value: 0,
              },
            },
          ],
        },
      },
      parameters: {
        "basic.simultaneous_threshold_milliseconds": 500 /* Default: 1000 */,
      },
      to: [
        {
          set_variable: {
            name: "SpaceFN",
            value: 1,
          },
        },
        {
          ...to,
        },
      ],
      type: "basic",
    },
    {
      conditions: [
        {
          name: "SpaceFN",
          type: "variable_if",
          value: 1,
        },
      ],
      from: {
        ...from,
        modifiers: {
          optional: ["any"],
        },
      },
      to: [
        {
          ...to,
        },
      ],
      type: "basic",
    },
  ];
}

function umlaut(character) {
  return [
    {
      from: {
        key_code: character,
        modifiers: {
          mandatory: ["option"],
          optional: ["caps_lock"],
        },
      },
      to: [
        {
          key_code: "u",
          modifiers: ["left_option"],
        },
        {
          key_code: character,
        },
        {
          key_code: "vk_none",
        },
      ],
      type: "basic",
    },
    {
      from: {
        key_code: character,
        modifiers: {
          mandatory: ["option", "shift"],
        },
      },
      to: [
        {
          key_code: "u",
          modifiers: ["left_option"],
        },
        {
          key_code: character,
          modifiers: ["left_shift"],
        },
        {
          key_code: "vk_none",
        },
      ],
      type: "basic",
    },
  ];
}

function swap(a, b) {
  return [...fromTo(a, b), ...fromTo(b, a)];
}

const DEVICE_DEFAULTS = {
  disable_built_in_keyboard_if_exists: false,
  fn_function_keys: [],
  ignore: false,
  manipulate_caps_lock_led: true,
  simple_modifications: [],
};

const IDENTIFIER_DEFAULTS = {
  is_keyboard: true,
  is_pointing_device: false,
};

const APPLE_INTERNAL = {
  ...DEVICE_DEFAULTS,
  identifiers: {
    ...IDENTIFIER_DEFAULTS,
    product_id: 834,
    vendor_id: 1452,
  },
};

const HHKB_PRO2_TYPE_S = {
  ...DEVICE_DEFAULTS,
  manipulate_caps_lock_led: false, // could cause issues on devices without a caps_lock LED
  identifiers: {
    ...IDENTIFIER_DEFAULTS,
    product_id: 256,
    vendor_id: 2131,
  },
};

const PARAMETER_DEFAULTS = {
  "basic.simultaneous_threshold_milliseconds": 50,
  "basic.to_delayed_action_delay_milliseconds": 500,
  "basic.to_if_alone_timeout_milliseconds": 1000,
  "basic.to_if_held_down_threshold_milliseconds": 500,
  "mouse_motion_to_scroll.speed": 100,
};

const VANILLA_PROFILE = {
  complex_modifications: {
    parameters: PARAMETER_DEFAULTS,
    rules: [],
  },
  devices: [],
  fn_function_keys: [
    fromTo(keyCode("f1"), consumerKeyCode("display_brightness_decrement")),
    fromTo(keyCode("f2"), consumerKeyCode("display_brightness_increment")),
    fromTo(keyCode("f3"), appleVendorKeyCode("mission_control")),
    fromTo(keyCode("f4"), appleVendorKeyCode("spotlight")),
    fromTo(keyCode("f5"), consumerKeyCode("dictation")),
    fromTo(keyCode("f6"), keyCode("f6")),
    fromTo(keyCode("f7"), consumerKeyCode("rewind")),
    fromTo(keyCode("f8"), consumerKeyCode("play_or_pause")),
    fromTo(keyCode("f9"), consumerKeyCode("fast_forward")),
    fromTo(keyCode("f10"), consumerKeyCode("mute")),
    fromTo(keyCode("f11"), consumerKeyCode("volume_decrement")),
    fromTo(keyCode("f12"), consumerKeyCode("volume_increment")),
  ],
  name: "Vanilla",
  parameters: {
    delay_milliseconds_before_open_device: 1000,
  },
  selected: false,
  simple_modifications: [],
  virtual_hid_keyboard: {
    country_code: 0,
    indicate_sticky_modifier_keys_state: true,
    mouse_key_xy_scale: 100,
  },
};

const DEFAULT_PROFILE = {
  ...VANILLA_PROFILE,
  complex_modifications: {
    parameters: {
      ...PARAMETER_DEFAULTS,
      "basic.to_if_alone_timeout_milliseconds": 500 /* Default: 1000 */,
    },
    rules: [
      {
        description: "Tab to Hyper/Tab (control+option+shift)",
        manipulators: [
          {
            from: {
              key_code: "tab",
              modifiers: {
                optional: ["any"],
              },
            },
            to: [
              {
                key_code: "right_control",
                modifiers: ["right_option", "right_shift"],
              },
            ],
            to_if_alone: [
              {
                key_code: "tab",
              },
            ],
            type: "basic",
          },
        ],
      },
      {
        description: "Hyper + return_or_enter launches Kitty",
        manipulators: [
          {
            from: {
              key_code: "return_or_enter",
              modifiers: {
                mandatory: ["right_control", "right_option", "right_shift"],
              },
            },
            to: [
              {
                shell_command: "/bin/sh $HOME/.bin/launchKitty.sh",
              },
            ],
            type: "basic",
          },
        ],
      },
      {
        description: "SpaceFN layer",
        manipulators: [
          // navigation and standard keys
          ...spaceFN(keyCode("h"), keyCode("left_arrow")),
          ...spaceFN(keyCode("j"), keyCode("down_arrow")),
          ...spaceFN(keyCode("k"), keyCode("up_arrow")),
          ...spaceFN(keyCode("l"), keyCode("right_arrow")),
          ...spaceFN(keyCode("y"), keyCode("home")),
          ...spaceFN(keyCode("u"), keyCode("page_down")),
          ...spaceFN(keyCode("i"), keyCode("page_up")),
          ...spaceFN(keyCode("o"), keyCode("end")),
          ...spaceFN(keyCode("escape"), keyCode("insert")),
          ...spaceFN(keyCode("delete_or_backspace"), keyCode("delete_forward")),
          ...spaceFN(keyCode("b"), keyCode("spacebar")),
          ...spaceFN(keyCode("p"), keyCode("print_screen")),
          // media controls
          ...spaceFN(keyCode("s"), consumerKeyCode("mute")),
          ...spaceFN(keyCode("d"), consumerKeyCode("volume_decrement")),
          ...spaceFN(keyCode("f"), consumerKeyCode("volume_increment")),
          ...spaceFN(keyCode("w"), consumerKeyCode("rewind")),
          ...spaceFN(keyCode("e"), consumerKeyCode("play_or_pause")),
          ...spaceFN(keyCode("r"), consumerKeyCode("fast_forward")),
          ...spaceFN(keyCode("c"), keyCode("scroll_lock")), // maps to brightness_down
          ...spaceFN(keyCode("v"), keyCode("pause")), // maps to brightness_up
          // function keys
          ...spaceFN(keyCode("1"), keyCode("f1")),
          ...spaceFN(keyCode("2"), keyCode("f2")),
          ...spaceFN(keyCode("3"), keyCode("f3")),
          ...spaceFN(keyCode("4"), keyCode("f4")),
          ...spaceFN(keyCode("5"), keyCode("f5")),
          ...spaceFN(keyCode("6"), keyCode("f6")),
          ...spaceFN(keyCode("7"), keyCode("f7")),
          ...spaceFN(keyCode("8"), keyCode("f8")),
          ...spaceFN(keyCode("9"), keyCode("f9")),
          ...spaceFN(keyCode("0"), keyCode("f10")),
          ...spaceFN(keyCode("hyphen"), keyCode("f11")),
          ...spaceFN(keyCode("equal_sign"), keyCode("f12")),
        ],
      },
      {
        description: "Umlauts on option + a/o/u",
        manipulators: [...umlaut("a"), ...umlaut("o"), ...umlaut("u")],
      },
    ],
  },
  devices: [APPLE_INTERNAL, HHKB_PRO2_TYPE_S],
  name: "Default",
  selected: true,
  simple_modifications: [fromTo(keyCode("caps_lock"), keyCode("left_control"))],
};

process.stdout.write(
  JSON.stringify(
    {
      global: {
        check_for_updates_on_startup: true,
        show_in_menu_bar: true,
        show_profile_name_in_menu_bar: false,
      },
      profiles: [DEFAULT_PROFILE, VANILLA_PROFILE],
    },
    null,
    2
  ) + "\n"
);
