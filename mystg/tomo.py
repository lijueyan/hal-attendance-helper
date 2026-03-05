# title: Hal Attendance Helper
# author: ChatGPT & Jueyan Li
# desc: A Pyxel game about HalBoy & HalGirl
# license: MIT
# version: 1.0

import pyxel

font = pyxel.Font("umplus_j10r.bdf")

class Game:

    def __init__(self):
        pyxel.init(160, 120, title="ハル出欠トモ", fps=60)
        pyxel.load("sound.pyxres")
        pyxel.mouse(True)

        self.scene = 0
        self.timer = 0

        self.char_select = None
        self.confirm_select = 0

        # =========================
        # キャラクタースプライト
        # =========================

        self.hal_boy = [
        "0000555555555550",
        "00055CCCCCCCCC50",
        "0055CCCCCC555550",
        "005CCC5555577700",
        "0055555777777700",
        "0007777707707700",
        "0007777777777700",
        "0007777777777700",
        "0007777777777700",
        "0007777777777700",
        "0007777777777700",
        "0007777777777700",
        "0007777777777700",
        "0000001000100000",
        "0000001000100000",
        "0000000000000000",
        ]

        self.hal_girl = [
        "0000800000000000",
        "0000880000000000",
        "000EE88777777700",
        "00E8EE8877777700",
        "88EE8E7777777700",
        "088EE77707707700",
        "0088777777777700",
        "0008777777777700",
        "0007777777777700",
        "0007777777777700",
        "0007777777777700",
        "0007777777777700",
        "0007777777777700",
        "0000002000200000",
        "0000002000200000",
        "0000000000000000",
        ]

        self.matsumoto = [
        "0000000000000000",
        "0000000000000000",
        "0000777777000000",
        "00077D7D77000000",
        "0007DD7DD7700000",
        "0007777777700000",
        "0007007007700000",
        "0007777777700000",
        "0007DD7DD7700000",
        "0007DD7DD7700000",
        "00077D7D77700000",
        "0007777777700000",
        "0007700077700000",
        "000077D777000000",
        "0000077770000000",
        "0000000000000000",
        ]

        self.load_sprite(0,0,self.hal_boy)
        self.load_sprite(16,0,self.hal_girl)
        self.load_sprite(32,0,self.matsumoto)

        # =========================
        # 会話イベント
        # =========================

        self.dialog_index = 0

        self.dialogs = [
        	("player", "失礼します。"),
                ("teacher", "あっ、ハルさんが来ました。"),
                ("teacher", "どうして遅刻したんですか？"),
                ("teacher", "電車遅延なんですか？"),
                ("player", "いいえ、寝坊したのです。"),
                ("teacher", "そうですか？危ないですよ。"),
                ("teacher", "ハルさんの出席率、"),
                ("teacher", "今何％か知ってます？"),
                ("player", "80％台だと思いますが…"),
                ("teacher", "今調べてみますね…"),
                ("teacher", "あっ、今ちょうど80％です。"),
                ("teacher", "かなりヤバイですよ。"),
                ("player", "すみません。気を付けます。"),
                ("teacher", "じゃあ座りなさい。"),
        	("player", "失礼します。"),
        ]

        pyxel.run(self.update, self.draw)

    # =========================
    # スプライト読み込み
    # =========================

    def load_sprite(self, x, y, sprite):

        data = []

        for row in sprite:

            line = ""

            for col in row:

                if col == "C":
                    line += "c"
                else:
                    line += col

            data.append(line)

        pyxel.images[0].set(x, y, data)

    # =========================
    # UPDATE
    # =========================

    def update(self):

        self.timer += 1

        if self.scene in [0,1]:
            if self.timer > 60 and self.check_start_input():
                self.scene += 1
                self.timer = 0

        elif self.scene == 2:
            if self.check_start_input():
                pyxel.play(0,2)
                self.scene = 3
                self.timer = 0

        elif self.scene == 3:

            if pyxel.btnp(pyxel.KEY_LEFT):
                self.char_select = 0

            if pyxel.btnp(pyxel.KEY_RIGHT):
                self.char_select = 1

            if pyxel.btnp(pyxel.MOUSE_BUTTON_LEFT):

                if pyxel.mouse_x < 80:
                    self.char_select = 0
                else:
                    self.char_select = 1

            if self.check_start_input():
                self.scene = 4

        elif self.scene == 4:

            if pyxel.btnp(pyxel.KEY_Y):
                self.scene = 5

            if pyxel.btnp(pyxel.KEY_N):
                self.scene = 3

            if pyxel.btnp(pyxel.MOUSE_BUTTON_LEFT):

                if pyxel.mouse_y > 80:

                    if pyxel.mouse_x < 80:
                        self.scene = 5
                    else:
                        self.scene = 3

        elif self.scene == 5:

            if self.check_start_input():
                self.scene = 6

        elif self.scene == 6:

            if self.check_start_input():

                self.dialog_index += 1

                if self.dialog_index >= len(self.dialogs):
                    pyxel.play(0,0)
                    self.scene = 7

        elif self.scene == 7:

            if self.check_start_input():
                pyxel.play(0,1)
                self.scene = 8

        elif self.scene == 8:

                if pyxel.btnp(pyxel.MOUSE_BUTTON_LEFT):

                    if 30 <= pyxel.mouse_x <= 130 and 70 <= pyxel.mouse_y <= 90:

                        import webbrowser
                        webbrowser.open("https://lijueyan.github.io/attendance-app/")

    # =========================
    # START入力
    # =========================

    def check_start_input(self):

        return (
            pyxel.btnp(pyxel.KEY_RETURN)
            or pyxel.btnp(pyxel.KEY_SPACE)
            or pyxel.btnp(pyxel.MOUSE_BUTTON_LEFT)
        )

    # =========================
    # DRAW
    # =========================

    def draw(self):

        pyxel.cls(0)

        # SCENE 0
        if self.scene == 0:
            pyxel.text(58,55,"LJY PRESENT",7)

        # SCENE 1
        elif self.scene == 1:
            pyxel.text(50,50,"ハル出欠トモ",7,font)

        # SCENE 2
        elif self.scene == 2:

            pyxel.text(50,50,"ハル出欠トモ",7,font)

            if (self.timer // 30) % 2 == 0:
                pyxel.text(58,80,"PRESS START",7)

        # =========================
        # キャラ選択
        # =========================

        elif self.scene == 3:

            pyxel.text(10,30,"キャラクターを選んでください。",7,font)

            # ハルボーイ
            pyxel.blt(40,55,0,0,0,16,16,0)
            pyxel.text(25,85,"ハルボーイ",7,font)

            # ハルガール
            pyxel.blt(100,55,0,16,0,16,16,0)
            pyxel.text(85,85,"ハルガール",7,font)

        # =========================
        # 確認
        # =========================

        elif self.scene == 4:

            if self.char_select == 0:
                name = "ハルボーイ"
                pyxel.blt(70,55,0,0,0,16,16,0)
            else:
                name = "ハルガール"
                pyxel.blt(70,55,0,16,0,16,16,0)


            # 前の文章
            pyxel.text(20,30,"[",7,font)

            # 名前だけ色変更
            pyxel.text(25,30,name,10,font)

            # 後ろの文章
            pyxel.text(75,30,"]にしますか？",7,font)

            # YES NO
            pyxel.text(40,85,"YES(Y)",7)
            pyxel.text(100,85,"NO(N)",7)

        # =========================
        # 次へ
        # =========================

        elif self.scene == 5:

            pyxel.text(43,50,"授業が始まる...",7,font)

        # =========================
        # 会話シーン
        # =========================

        elif self.scene == 6:

            # 先生
            pyxel.blt(110,50,0,32,0,16,16,0)
            pyxel.text(100,30,"松本先生",7,font)

            # プレイヤー
            if self.char_select == 0:
                pyxel.blt(35,50,0,0,0,16,16,0)
                player_name = "ハルボーイ"
            else:
                pyxel.blt(35,50,0,16,0,16,16,0)
                player_name = "ハルガール"

            pyxel.text(20,30,player_name,7,font)

            # 会話取得
            speaker, text = self.dialogs[self.dialog_index]

            # 吹き出し
            if speaker == "teacher":

                pyxel.text(110,80,"松本先生",7,font)
                pyxel.rect(10,92,140,20,1)
                pyxel.rectb(10,92,140,20,7)
                pyxel.text(15,96,text,0,font)

            else:

                pyxel.text(10,80,player_name,7,font)
                pyxel.rect(10,92,140,20,1)
                pyxel.rectb(10,92,140,20,7)
                pyxel.text(15,96,text,0,font)

            pyxel.text(122,113,"CLICK >",6)

        # =========================
        # メッセージ
        # =========================

        elif self.scene == 7:

            pyxel.text(10,30,"出席率は50％を下回ると",7,font)
            pyxel.text(10,45,"進級できない可能性があります。",7,font)
            pyxel.text(10,65,"自分の出席率を",7,font)
            pyxel.text(10,80,"日頃から確認しましょう。",7,font)

            pyxel.text(122,113,"CLICK >",6)

        # =========================
        # ハイパーリンク
        # =========================

        elif self.scene == 8:

                pyxel.text(33,40,"「ハル出欠トモ」へ",7,font)

                pyxel.rect(30,72,100,20,1)
                pyxel.text(52,76,"アプリを開く",7,font)

Game()