import { OnInit, ElementRef, ViewChild } from '@angular/core';
import { Service } from '@wiz/service/service';
import { io } from "socket.io-client";
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';

export class Component implements OnInit {
    @ViewChild('terminal')
    public terminal: ElementRef;

    public APP_ID: string = wiz.namespace;

    constructor(public service: Service) { }

    public async ngOnInit() {
        await this.service.render();

        const modw = 9;
        const modh = 17;

        let { offsetWidth, offsetHeight } = this.terminal.nativeElement;

        let cols = Math.floor(offsetWidth / modw) - 1;
        let rows = Math.floor(offsetHeight / modh);

        await this.service.render();
        const term = new Terminal({ cursorBlink: true, macOptionIsMeta: true });
        const fit = new FitAddon();
        term.loadAddon(new WebLinksAddon());
        term.loadAddon(new SearchAddon());
        term.loadAddon(fit);

        term.resize(cols, rows);

        term.open(this.terminal.nativeElement);
        term.writeln("Welcome to wiz.term!");
        term.writeln('')
        term.onData((data) => {
            socket.emit("ptyinput", { input: data });
        });

        const socket = io.connect("/wiz/ide/app/xterm.app.term");
        socket.on("ptyoutput", function (data) {
            term.write(data.output);
        });

        socket.on("connect", () => {
            fitToscreen();
        });

        socket.on("disconnect", () => {
        });

        function fitToscreen() {
            fit.fit();
            const dims = { cols: term.cols, rows: term.rows };
            socket.emit("resize", dims);
        }
    }
}