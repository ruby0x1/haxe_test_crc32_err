
//Open index.html in browser, see Waiting...

//Working results:
//{ width : 128, height : 128, colbits : 8, color : ColTrue(true), interlaced : false }
//Not working results:
//Stuck on waiting, error in console about crc failure

class Test {

    static function main() {

        var raw_bytes = haxe.Resource.getBytes('tiny.ui.png');
        var byte_input = new haxe.io.BytesInput(raw_bytes, 0, raw_bytes.length);
        var png_reader = new format.png.Reader(byte_input);

        #if without_crc
            png_reader.checkCRC = false;
        #end

        var png_data = png_reader.read();
        var png_bytes = format.png.Tools.extract32(png_data);
        var png_header = format.png.Tools.getHeader(png_data);

        trace(png_header);

        var el = js.Browser.document.getElementById('result');
            el.textContent = Std.string(png_header);

    }

}
