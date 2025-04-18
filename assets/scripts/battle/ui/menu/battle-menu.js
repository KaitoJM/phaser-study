import Phaser from "../../../lib/phaser.js";
import {
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
} from "../../../assets/asset-keys.js";
import { DIRECTION } from "../../../common/direction.js";
import { exhaustiveGuard } from "../../../utils/guard.js";
import {
  ACTIVE_BATTLE_MENU,
  ATTACK_MOVE_OPTIONS,
  BATTLE_MENU_OPTIONS,
} from "./battle-menu-options.js";
import { BATTLE_UI_TEXT_STYLE } from "./battle-menu-config.js";

const battleMenuCursorPosition = Object.freeze({
  x: 42,
  y: 38,
});

const attackMenuCursorPosition = Object.freeze({
  x: 42,
  y: 38,
});

export class BattleMenu {
  /** @type {Phaser.Scene} */
  #scene;
  /** @type {Phaser.GameObjects.Container} */
  #mainBattleMenuPhaserContainerGameObject;
  /** @type {Phaser.GameObjects.Container} */
  #moveSelectionSubBattleMenuPhaserContainerGameObject;
  /** @type {Phaser.GameObjects.Text} */
  #battleTextGameObjectLine1;
  /** @type {Phaser.GameObjects.Text} */
  #battleTextGameObjectLine2;
  /** @type {Phaser.GameObjects.Image} */
  #mainBattleMenuCursorPhaserImageGameObject;
  /** @type {Phaser.GameObjects.Image} */
  #attackBattleMenuCursorPhaserImageGameObject;
  /** @type {import("./battle-menu-options.js").BattleMenuOptions} */
  #selectedBattleMenuOption;
  /** @type {import("./battle-menu-options.js").AttackMoveOptions} */
  #selectedAttackeMenuOption;
  /** @type {import("./battle-menu-options.js").ActiveBattleMenu} */
  #activeBattleMenu;

  /**
   *
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.#scene = scene;
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
    this.#createMainInfoPane();
    this.#createMainBattleMenu();
    this.#createMonsterAttackSubMenu();
  }

  showMainBattleMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#battleTextGameObjectLine1.setText("What should");
    this.#mainBattleMenuPhaserContainerGameObject.setAlpha(1);
    this.#battleTextGameObjectLine1.setAlpha(1);
    this.#battleTextGameObjectLine2.setAlpha(1);

    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(
      battleMenuCursorPosition.x,
      battleMenuCursorPosition.y
    );
  }

  hideMainBattleMenu() {
    this.#mainBattleMenuPhaserContainerGameObject.setAlpha(0);
    this.#battleTextGameObjectLine1.setAlpha(0);
    this.#battleTextGameObjectLine2.setAlpha(0);
  }

  showMonsterAttackSubMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(1);
  }

  hideMonsterAttackSubMenu() {
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(0);
  }

  /**
   *
   * @param { import("../../../common/direction.js").Direction | 'OK' | 'CANCEL'} input
   */
  handlePlayerInput(input) {
    console.log(input);

    if (input == "CANCEL") {
      this.hideMonsterAttackSubMenu();
      this.showMainBattleMenu();
      return;
    }

    if (input == "OK") {
      this.hideMainBattleMenu();
      this.showMonsterAttackSubMenu();
      return;
    }

    this.#updateSelectedBattleMenuOptionFromInput(input);
    this.#moveMainBattleMenuCursor();
    this.#updateSelectedAttackMenuOptionFromInput(input);
    this.#moveMainAttackMenuCursor();
  }

  #createMainBattleMenu() {
    this.#battleTextGameObjectLine1 = this.#scene.add.text(
      20,
      468,
      "What should",
      BATTLE_UI_TEXT_STYLE
    );
    this.#battleTextGameObjectLine2 = this.#scene.add.text(
      20,
      512,
      `${MONSTER_ASSET_KEYS.IGUANIGNITE} do next?`,
      BATTLE_UI_TEXT_STYLE
    );

    this.#mainBattleMenuCursorPhaserImageGameObject = this.#scene.add
      .image(
        battleMenuCursorPosition.x,
        battleMenuCursorPosition.y,
        UI_ASSET_KEYS.CURSOR,
        0
      )
      .setOrigin(0.5)
      .setScale(2.5);

    this.#mainBattleMenuPhaserContainerGameObject = this.#scene.add.container(
      520,
      448,
      [
        this.#createMainInfoSubPane(),
        this.#scene.add.text(
          55,
          22,
          BATTLE_MENU_OPTIONS.FIGHT,
          BATTLE_UI_TEXT_STYLE
        ),
        this.#scene.add.text(
          240,
          22,
          BATTLE_MENU_OPTIONS.SWITCH,
          BATTLE_UI_TEXT_STYLE
        ),
        this.#scene.add.text(
          55,
          70,
          BATTLE_MENU_OPTIONS.ITEM,
          BATTLE_UI_TEXT_STYLE
        ),
        this.#scene.add.text(
          240,
          70,
          BATTLE_MENU_OPTIONS.FLEE,
          BATTLE_UI_TEXT_STYLE
        ),
        this.#mainBattleMenuCursorPhaserImageGameObject,
      ]
    );

    this.hideMainBattleMenu();
  }

  #createMonsterAttackSubMenu() {
    this.#attackBattleMenuCursorPhaserImageGameObject = this.#scene.add
      .image(42, 38, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(2.5);
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject =
      this.#scene.add.container(0, 448, [
        this.#scene.add.text(55, 22, "scratch", BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(240, 22, "ember", BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(55, 70, "-", BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(240, 70, "-", BATTLE_UI_TEXT_STYLE),
        this.#attackBattleMenuCursorPhaserImageGameObject,
      ]);

    this.hideMonsterAttackSubMenu();
  }

  #createMainInfoPane() {
    const padding = 4;
    const rectangleHeight = 124;

    this.#scene.add
      .rectangle(
        padding,
        this.#scene.scale.height - rectangleHeight - padding,
        this.#scene.scale.width - padding * 2,
        rectangleHeight,
        0xede4f3,
        1
      )
      .setStrokeStyle(8, 0xe4434a, 1)
      .setOrigin(0);
  }

  #createMainInfoSubPane() {
    const reactangleWidth = 500;
    const rectangleHeight = 124;

    return this.#scene.add
      .rectangle(0, 0, reactangleWidth, rectangleHeight, 0xede4f3, 1)
      .setStrokeStyle(8, 0x905ac2, 1)
      .setOrigin(0);
  }

  /**
   *
   * @param { import("../../../common/direction.js").Direction} direction
   */
  #updateSelectedBattleMenuOptionFromInput(direction) {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }
    if (this.#selectedBattleMenuOption == BATTLE_MENU_OPTIONS.FIGHT) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
          return;
        case DIRECTION.DOWN:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
          return;
        case DIRECTION.LEFT:
          return;
        case DIRECTION.UP:
          return;
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }

      return;
    }

    if (this.#selectedBattleMenuOption == BATTLE_MENU_OPTIONS.SWITCH) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.DOWN:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
          return;
        case DIRECTION.RIGHT:
          return;
        case DIRECTION.UP:
          return;
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }

      return;
    }

    if (this.#selectedBattleMenuOption == BATTLE_MENU_OPTIONS.ITEM) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
          return;
        case DIRECTION.UP:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.LEFT:
          return;
        case DIRECTION.DOWN:
          return;
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }

      return;
    }

    if (this.#selectedBattleMenuOption == BATTLE_MENU_OPTIONS.FLEE) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
          return;
        case DIRECTION.UP:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
          return;
        case DIRECTION.RIGHT:
          return;
        case DIRECTION.DOWN:
          return;
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }

      return;
    }

    exhaustiveGuard(this.#selectedBattleMenuOption);
  }

  #moveMainBattleMenuCursor() {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }

    switch (this.#selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(
          battleMenuCursorPosition.x,
          battleMenuCursorPosition.y
        );
        return;
      case BATTLE_MENU_OPTIONS.SWITCH:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(
          228,
          battleMenuCursorPosition.y
        );
        return;
      case BATTLE_MENU_OPTIONS.ITEM:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(
          battleMenuCursorPosition.x,
          86
        );
        return;
      case BATTLE_MENU_OPTIONS.FLEE:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.#selectedBattleMenuOption);
    }
  }

  /**
   *
   * @param { import("../../../common/direction.js").Direction} direction
   */
  #updateSelectedAttackMenuOptionFromInput(direction) {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    if (this.#selectedAttackeMenuOption == ATTACK_MOVE_OPTIONS.MOVE_1) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
          return;
        case DIRECTION.DOWN:
          this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
          return;
        case DIRECTION.LEFT:
          return;
        case DIRECTION.UP:
          return;
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }

      return;
    }

    if (this.#selectedAttackeMenuOption == ATTACK_MOVE_OPTIONS.MOVE_2) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
          return;
        case DIRECTION.DOWN:
          this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
          return;
        case DIRECTION.RIGHT:
          return;
        case DIRECTION.UP:
          return;
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }

      return;
    }

    if (this.#selectedAttackeMenuOption == ATTACK_MOVE_OPTIONS.MOVE_3) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
          return;
        case DIRECTION.UP:
          this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
          return;
        case DIRECTION.LEFT:
          return;
        case DIRECTION.DOWN:
          return;
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }

      return;
    }

    if (this.#selectedAttackeMenuOption == ATTACK_MOVE_OPTIONS.MOVE_4) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
          return;
        case DIRECTION.UP:
          this.#selectedAttackeMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
          return;
        case DIRECTION.RIGHT:
          return;
        case DIRECTION.DOWN:
          return;
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }

      return;
    }

    exhaustiveGuard(this.#selectedAttackeMenuOption);
  }

  #moveMainAttackMenuCursor() {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    switch (this.#selectedAttackeMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(
          attackMenuCursorPosition.x,
          attackMenuCursorPosition.y
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(
          228,
          attackMenuCursorPosition.y
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(
          attackMenuCursorPosition.x,
          86
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.#selectedAttackeMenuOption);
    }
  }
}
