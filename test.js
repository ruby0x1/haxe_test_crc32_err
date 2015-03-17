(function (console) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,__class__: List
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var Test = function() { };
Test.__name__ = true;
Test.main = function() {
	var raw_bytes = haxe_Resource.getBytes("tiny.ui.png");
	var byte_input = new haxe_io_BytesInput(raw_bytes,0,raw_bytes.length);
	var png_reader = new format_png_Reader(byte_input);
	var png_data = png_reader.read();
	var png_bytes = format_png_Tools.extract32(png_data);
	var png_header = format_png_Tools.getHeader(png_data);
	console.log(png_header);
	var el = window.document.getElementById("result");
	el.textContent = Std.string(png_header);
};
var format_png_Color = { __ename__ : true, __constructs__ : ["ColGrey","ColTrue","ColIndexed"] };
format_png_Color.ColGrey = function(alpha) { var $x = ["ColGrey",0,alpha]; $x.__enum__ = format_png_Color; return $x; };
format_png_Color.ColTrue = function(alpha) { var $x = ["ColTrue",1,alpha]; $x.__enum__ = format_png_Color; return $x; };
format_png_Color.ColIndexed = ["ColIndexed",2];
format_png_Color.ColIndexed.__enum__ = format_png_Color;
var format_png_Chunk = { __ename__ : true, __constructs__ : ["CEnd","CHeader","CData","CPalette","CUnknown"] };
format_png_Chunk.CEnd = ["CEnd",0];
format_png_Chunk.CEnd.__enum__ = format_png_Chunk;
format_png_Chunk.CHeader = function(h) { var $x = ["CHeader",1,h]; $x.__enum__ = format_png_Chunk; return $x; };
format_png_Chunk.CData = function(b) { var $x = ["CData",2,b]; $x.__enum__ = format_png_Chunk; return $x; };
format_png_Chunk.CPalette = function(b) { var $x = ["CPalette",3,b]; $x.__enum__ = format_png_Chunk; return $x; };
format_png_Chunk.CUnknown = function(id,data) { var $x = ["CUnknown",4,id,data]; $x.__enum__ = format_png_Chunk; return $x; };
var format_png_Reader = function(i) {
	this.i = i;
	i.set_bigEndian(true);
	this.checkCRC = true;
};
format_png_Reader.__name__ = true;
format_png_Reader.prototype = {
	read: function() {
		var _g = 0;
		var _g1 = [137,80,78,71,13,10,26,10];
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			if(this.i.readByte() != b) throw "Invalid header";
		}
		var l = new List();
		while(true) {
			var c = this.readChunk();
			l.add(c);
			if(c == format_png_Chunk.CEnd) break;
		}
		return l;
	}
	,readHeader: function(i) {
		i.set_bigEndian(true);
		var width = i.readInt32();
		var height = i.readInt32();
		var colbits = i.readByte();
		var color = i.readByte();
		var color1;
		switch(color) {
		case 0:
			color1 = format_png_Color.ColGrey(false);
			break;
		case 2:
			color1 = format_png_Color.ColTrue(false);
			break;
		case 3:
			color1 = format_png_Color.ColIndexed;
			break;
		case 4:
			color1 = format_png_Color.ColGrey(true);
			break;
		case 6:
			color1 = format_png_Color.ColTrue(true);
			break;
		default:
			throw "Unknown color model " + color + ":" + colbits;
		}
		var compress = i.readByte();
		var filter = i.readByte();
		if(compress != 0 || filter != 0) throw "Invalid header";
		var interlace = i.readByte();
		if(interlace != 0 && interlace != 1) throw "Invalid header";
		return { width : width, height : height, colbits : colbits, color : color1, interlaced : interlace == 1};
	}
	,readChunk: function() {
		var dataLen = this.i.readInt32();
		var id = this.i.readString(4);
		var data = this.i.read(dataLen);
		var crc = this.i.readInt32();
		if(this.checkCRC) {
			var c = new haxe_crypto_Crc32();
			var _g = 0;
			while(_g < 4) {
				var i = _g++;
				c["byte"](HxOverrides.cca(id,i));
			}
			c.update(data,0,data.length);
			if(c.get() != crc) throw "CRC check failure";
		}
		switch(id) {
		case "IEND":
			return format_png_Chunk.CEnd;
		case "IHDR":
			return format_png_Chunk.CHeader(this.readHeader(new haxe_io_BytesInput(data)));
		case "IDAT":
			return format_png_Chunk.CData(data);
		case "PLTE":
			return format_png_Chunk.CPalette(data);
		default:
			return format_png_Chunk.CUnknown(id,data);
		}
	}
	,__class__: format_png_Reader
};
var format_png_Tools = function() { };
format_png_Tools.__name__ = true;
format_png_Tools.getHeader = function(d) {
	var _g_head = d.h;
	var _g_val = null;
	while(_g_head != null) {
		var c;
		c = (function($this) {
			var $r;
			_g_val = _g_head[0];
			_g_head = _g_head[1];
			$r = _g_val;
			return $r;
		}(this));
		switch(c[1]) {
		case 1:
			var h = c[2];
			return h;
		default:
		}
	}
	throw "Header not found";
};
format_png_Tools.getPalette = function(d) {
	var _g_head = d.h;
	var _g_val = null;
	while(_g_head != null) {
		var c;
		c = (function($this) {
			var $r;
			_g_val = _g_head[0];
			_g_head = _g_head[1];
			$r = _g_val;
			return $r;
		}(this));
		switch(c[1]) {
		case 3:
			var b = c[2];
			return b;
		default:
		}
	}
	return null;
};
format_png_Tools.filter = function(data,x,y,stride,prev,p,numChannels) {
	if(numChannels == null) numChannels = 4;
	var b;
	if(y == 0) b = 0; else b = data.b[p - stride];
	var c;
	if(x == 0 || y == 0) c = 0; else c = data.b[p - stride - numChannels];
	var k = prev + b - c;
	var pa = k - prev;
	if(pa < 0) pa = -pa;
	var pb = k - b;
	if(pb < 0) pb = -pb;
	var pc = k - c;
	if(pc < 0) pc = -pc;
	if(pa <= pb && pa <= pc) return prev; else if(pb <= pc) return b; else return c;
};
format_png_Tools.reverseBytes = function(b) {
	var p = 0;
	var _g1 = 0;
	var _g = b.length >> 2;
	while(_g1 < _g) {
		var i = _g1++;
		var b1 = b.b[p];
		var g = b.b[p + 1];
		var r = b.b[p + 2];
		var a = b.b[p + 3];
		var p1 = p++;
		b.b[p1] = a & 255;
		var p2 = p++;
		b.b[p2] = r & 255;
		var p3 = p++;
		b.b[p3] = g & 255;
		var p4 = p++;
		b.b[p4] = b1 & 255;
	}
};
format_png_Tools.extractGrey = function(d) {
	var h = format_png_Tools.getHeader(d);
	var grey = haxe_io_Bytes.alloc(h.width * h.height);
	var data = null;
	var fullData = null;
	var _g_head = d.h;
	var _g_val = null;
	while(_g_head != null) {
		var c;
		c = (function($this) {
			var $r;
			_g_val = _g_head[0];
			_g_head = _g_head[1];
			$r = _g_val;
			return $r;
		}(this));
		switch(c[1]) {
		case 2:
			var b = c[2];
			if(fullData != null) fullData.add(b); else if(data == null) data = b; else {
				fullData = new haxe_io_BytesBuffer();
				fullData.add(data);
				fullData.add(b);
				data = null;
			}
			break;
		default:
		}
	}
	if(fullData != null) data = fullData.getBytes();
	if(data == null) throw "Data not found";
	data = format_tools_Inflate.run(data);
	var r = 0;
	var w = 0;
	{
		var _g = h.color;
		switch(_g[1]) {
		case 0:
			var alpha = _g[2];
			if(h.colbits != 8) throw "Unsupported color mode";
			var width = h.width;
			var stride;
			stride = (alpha?2:1) * width + 1;
			if(data.length < h.height * stride) throw "Not enough data";
			var rinc;
			if(alpha) rinc = 2; else rinc = 1;
			var _g2 = 0;
			var _g1 = h.height;
			while(_g2 < _g1) {
				var y = _g2++;
				var f = data.get(r++);
				switch(f) {
				case 0:
					var _g3 = 0;
					while(_g3 < width) {
						var x = _g3++;
						var v = data.b[r];
						r += rinc;
						grey.set(w++,v);
					}
					break;
				case 1:
					var cv = 0;
					var _g31 = 0;
					while(_g31 < width) {
						var x1 = _g31++;
						cv += data.b[r];
						r += rinc;
						grey.set(w++,cv);
					}
					break;
				case 2:
					var stride1;
					if(y == 0) stride1 = 0; else stride1 = width;
					var _g32 = 0;
					while(_g32 < width) {
						var x2 = _g32++;
						var v1 = data.b[r] + grey.b[w - stride1];
						r += rinc;
						grey.set(w++,v1);
					}
					break;
				case 3:
					var cv1 = 0;
					var stride2;
					if(y == 0) stride2 = 0; else stride2 = width;
					var _g33 = 0;
					while(_g33 < width) {
						var x3 = _g33++;
						cv1 = data.b[r] + (cv1 + grey.b[w - stride2] >> 1) & 255;
						r += rinc;
						grey.set(w++,cv1);
					}
					break;
				case 4:
					var stride3 = width;
					var cv2 = 0;
					var _g34 = 0;
					while(_g34 < width) {
						var x4 = _g34++;
						cv2 = format_png_Tools.filter(grey,x4,y,stride3,cv2,w,1) + data.b[r] & 255;
						r += rinc;
						grey.set(w++,cv2);
					}
					break;
				default:
					throw "Invalid filter " + f;
				}
			}
			break;
		default:
			throw "Unsupported color mode";
		}
	}
	return grey;
};
format_png_Tools.extract32 = function(d,bytes) {
	var h = format_png_Tools.getHeader(d);
	var bgra;
	if(bytes == null) bgra = haxe_io_Bytes.alloc(h.width * h.height * 4); else bgra = bytes;
	var data = null;
	var fullData = null;
	var _g_head = d.h;
	var _g_val = null;
	while(_g_head != null) {
		var c;
		c = (function($this) {
			var $r;
			_g_val = _g_head[0];
			_g_head = _g_head[1];
			$r = _g_val;
			return $r;
		}(this));
		switch(c[1]) {
		case 2:
			var b = c[2];
			if(fullData != null) fullData.add(b); else if(data == null) data = b; else {
				fullData = new haxe_io_BytesBuffer();
				fullData.add(data);
				fullData.add(b);
				data = null;
			}
			break;
		default:
		}
	}
	if(fullData != null) data = fullData.getBytes();
	if(data == null) throw "Data not found";
	data = format_tools_Inflate.run(data);
	var r = 0;
	var w = 0;
	{
		var _g = h.color;
		switch(_g[1]) {
		case 2:
			var pal = format_png_Tools.getPalette(d);
			if(pal == null) throw "PNG Palette is missing";
			var alpha = null;
			var _g1_head = d.h;
			var _g1_val = null;
			try {
				while(_g1_head != null) {
					var t;
					t = (function($this) {
						var $r;
						_g1_val = _g1_head[0];
						_g1_head = _g1_head[1];
						$r = _g1_val;
						return $r;
					}(this));
					switch(t[1]) {
					case 4:
						switch(t[2]) {
						case "tRNS":
							var data1 = t[3];
							alpha = data1;
							throw "__break__";
							break;
						default:
						}
						break;
					default:
					}
				}
			} catch( e ) { if( e != "__break__" ) throw e; }
			if(alpha != null && alpha.length < 1 << h.colbits) {
				var alpha2 = haxe_io_Bytes.alloc(1 << h.colbits);
				alpha2.blit(0,alpha,0,alpha.length);
				alpha2.fill(alpha.length,alpha2.length - alpha.length,255);
				alpha = alpha2;
			}
			var width = h.width;
			var stride = Math.ceil(width * h.colbits / 8) + 1;
			if(data.length < h.height * stride) throw "Not enough data";
			var vr;
			var vg;
			var vb;
			var va = 255;
			if(h.colbits == 8) {
				var _g2 = 0;
				var _g1 = h.height;
				while(_g2 < _g1) {
					var y = _g2++;
					var f = data.get(r++);
					switch(f) {
					case 0:
						var _g11 = 0;
						while(_g11 < width) {
							var x = _g11++;
							var c1 = data.get(r++);
							vr = pal.b[c1 * 3];
							vg = pal.b[c1 * 3 + 1];
							vb = pal.b[c1 * 3 + 2];
							if(alpha != null) va = alpha.b[c1];
							bgra.set(w++,vb);
							bgra.set(w++,vg);
							bgra.set(w++,vr);
							bgra.set(w++,va);
						}
						break;
					case 1:
						var cr = 0;
						var cg = 0;
						var cb = 0;
						var ca = 0;
						var _g12 = 0;
						while(_g12 < width) {
							var x1 = _g12++;
							var c2 = data.get(r++);
							vr = pal.b[c2 * 3];
							vg = pal.b[c2 * 3 + 1];
							vb = pal.b[c2 * 3 + 2];
							if(alpha != null) va = alpha.b[c2];
							cb += vb;
							bgra.set(w++,cb);
							cg += vg;
							bgra.set(w++,cg);
							cr += vr;
							bgra.set(w++,cr);
							ca += va;
							bgra.set(w++,ca);
							bgra.set(w++,va);
						}
						break;
					case 2:
						var stride1;
						if(y == 0) stride1 = 0; else stride1 = width * 4;
						var _g13 = 0;
						while(_g13 < width) {
							var x2 = _g13++;
							var c3 = data.get(r++);
							vr = pal.b[c3 * 3];
							vg = pal.b[c3 * 3 + 1];
							vb = pal.b[c3 * 3 + 2];
							if(alpha != null) va = alpha.b[c3];
							bgra.b[w] = vb + bgra.b[w - stride1] & 255;
							w++;
							bgra.b[w] = vg + bgra.b[w - stride1] & 255;
							w++;
							bgra.b[w] = vr + bgra.b[w - stride1] & 255;
							w++;
							bgra.b[w] = va + bgra.b[w - stride1] & 255;
							w++;
						}
						break;
					case 3:
						var cr1 = 0;
						var cg1 = 0;
						var cb1 = 0;
						var ca1 = 0;
						var stride2;
						if(y == 0) stride2 = 0; else stride2 = width * 4;
						var _g14 = 0;
						while(_g14 < width) {
							var x3 = _g14++;
							var c4 = data.get(r++);
							vr = pal.b[c4 * 3];
							vg = pal.b[c4 * 3 + 1];
							vb = pal.b[c4 * 3 + 2];
							if(alpha != null) va = alpha.b[c4];
							cb1 = vb + (cb1 + bgra.b[w - stride2] >> 1) & 255;
							bgra.set(w++,cb1);
							cg1 = vg + (cg1 + bgra.b[w - stride2] >> 1) & 255;
							bgra.set(w++,cg1);
							cr1 = vr + (cr1 + bgra.b[w - stride2] >> 1) & 255;
							bgra.set(w++,cr1);
							cr1 = va + (ca1 + bgra.b[w - stride2] >> 1) & 255;
							bgra.set(w++,ca1);
						}
						break;
					case 4:
						var stride3 = width * 4;
						var cr2 = 0;
						var cg2 = 0;
						var cb2 = 0;
						var ca2 = 0;
						var _g15 = 0;
						while(_g15 < width) {
							var x4 = _g15++;
							var c5 = data.get(r++);
							vr = pal.b[c5 * 3];
							vg = pal.b[c5 * 3 + 1];
							vb = pal.b[c5 * 3 + 2];
							if(alpha != null) va = alpha.b[c5];
							cb2 = format_png_Tools.filter(bgra,x4,y,stride3,cb2,w,null) + vb & 255;
							bgra.set(w++,cb2);
							cg2 = format_png_Tools.filter(bgra,x4,y,stride3,cg2,w,null) + vg & 255;
							bgra.set(w++,cg2);
							cr2 = format_png_Tools.filter(bgra,x4,y,stride3,cr2,w,null) + vr & 255;
							bgra.set(w++,cr2);
							ca2 = format_png_Tools.filter(bgra,x4,y,stride3,ca2,w,null) + va & 255;
							bgra.set(w++,ca2);
						}
						break;
					default:
						throw "Invalid filter " + f;
					}
				}
			} else if(h.colbits < 8) {
				var req = h.colbits;
				var mask = (1 << req) - 1;
				var _g21 = 0;
				var _g16 = h.height;
				while(_g21 < _g16) {
					var y1 = _g21++;
					var f1 = data.get(r++);
					var bits = 0;
					var nbits = 0;
					var v;
					switch(f1) {
					case 0:
						var _g17 = 0;
						while(_g17 < width) {
							var x5 = _g17++;
							var c6;
							if(nbits < req) {
								bits = bits << 8 | data.get(r++);
								nbits += 8;
							}
							v = bits >>> nbits - req & mask;
							nbits -= req;
							c6 = v;
							vr = pal.b[c6 * 3];
							vg = pal.b[c6 * 3 + 1];
							vb = pal.b[c6 * 3 + 2];
							if(alpha != null) va = alpha.b[c6];
							bgra.set(w++,vb);
							bgra.set(w++,vg);
							bgra.set(w++,vr);
							bgra.set(w++,va);
						}
						break;
					case 1:
						var cr3 = 0;
						var cg3 = 0;
						var cb3 = 0;
						var ca3 = 0;
						var _g18 = 0;
						while(_g18 < width) {
							var x6 = _g18++;
							var c7;
							if(nbits < req) {
								bits = bits << 8 | data.get(r++);
								nbits += 8;
							}
							v = bits >>> nbits - req & mask;
							nbits -= req;
							c7 = v;
							vr = pal.b[c7 * 3];
							vg = pal.b[c7 * 3 + 1];
							vb = pal.b[c7 * 3 + 2];
							if(alpha != null) va = alpha.b[c7];
							cb3 += vb;
							bgra.set(w++,cb3);
							cg3 += vg;
							bgra.set(w++,cg3);
							cr3 += vr;
							bgra.set(w++,cr3);
							ca3 += va;
							bgra.set(w++,ca3);
							bgra.set(w++,va);
						}
						break;
					case 2:
						var stride4;
						if(y1 == 0) stride4 = 0; else stride4 = width * 4;
						var _g19 = 0;
						while(_g19 < width) {
							var x7 = _g19++;
							var c8;
							if(nbits < req) {
								bits = bits << 8 | data.get(r++);
								nbits += 8;
							}
							v = bits >>> nbits - req & mask;
							nbits -= req;
							c8 = v;
							vr = pal.b[c8 * 3];
							vg = pal.b[c8 * 3 + 1];
							vb = pal.b[c8 * 3 + 2];
							if(alpha != null) va = alpha.b[c8];
							bgra.b[w] = vb + bgra.b[w - stride4] & 255;
							w++;
							bgra.b[w] = vg + bgra.b[w - stride4] & 255;
							w++;
							bgra.b[w] = vr + bgra.b[w - stride4] & 255;
							w++;
							bgra.b[w] = va + bgra.b[w - stride4] & 255;
							w++;
						}
						break;
					case 3:
						var cr4 = 0;
						var cg4 = 0;
						var cb4 = 0;
						var ca4 = 0;
						var stride5;
						if(y1 == 0) stride5 = 0; else stride5 = width * 4;
						var _g110 = 0;
						while(_g110 < width) {
							var x8 = _g110++;
							var c9;
							if(nbits < req) {
								bits = bits << 8 | data.get(r++);
								nbits += 8;
							}
							v = bits >>> nbits - req & mask;
							nbits -= req;
							c9 = v;
							vr = pal.b[c9 * 3];
							vg = pal.b[c9 * 3 + 1];
							vb = pal.b[c9 * 3 + 2];
							if(alpha != null) va = alpha.b[c9];
							cb4 = vb + (cb4 + bgra.b[w - stride5] >> 1) & 255;
							bgra.set(w++,cb4);
							cg4 = vg + (cg4 + bgra.b[w - stride5] >> 1) & 255;
							bgra.set(w++,cg4);
							cr4 = vr + (cr4 + bgra.b[w - stride5] >> 1) & 255;
							bgra.set(w++,cr4);
							cr4 = va + (ca4 + bgra.b[w - stride5] >> 1) & 255;
							bgra.set(w++,ca4);
						}
						break;
					case 4:
						var stride6 = width * 4;
						var cr5 = 0;
						var cg5 = 0;
						var cb5 = 0;
						var ca5 = 0;
						var _g111 = 0;
						while(_g111 < width) {
							var x9 = _g111++;
							var c10;
							if(nbits < req) {
								bits = bits << 8 | data.get(r++);
								nbits += 8;
							}
							v = bits >>> nbits - req & mask;
							nbits -= req;
							c10 = v;
							vr = pal.b[c10 * 3];
							vg = pal.b[c10 * 3 + 1];
							vb = pal.b[c10 * 3 + 2];
							if(alpha != null) va = alpha.b[c10];
							cb5 = format_png_Tools.filter(bgra,x9,y1,stride6,cb5,w,null) + vb & 255;
							bgra.set(w++,cb5);
							cg5 = format_png_Tools.filter(bgra,x9,y1,stride6,cg5,w,null) + vg & 255;
							bgra.set(w++,cg5);
							cr5 = format_png_Tools.filter(bgra,x9,y1,stride6,cr5,w,null) + vr & 255;
							bgra.set(w++,cr5);
							ca5 = format_png_Tools.filter(bgra,x9,y1,stride6,ca5,w,null) + va & 255;
							bgra.set(w++,ca5);
						}
						break;
					default:
						throw "Invalid filter " + f1;
					}
				}
			} else throw h.colbits + " indexed bits per pixel not supported";
			break;
		case 0:
			var alpha1 = _g[2];
			if(h.colbits != 8) throw "Unsupported color mode";
			var width1 = h.width;
			var stride7;
			stride7 = (alpha1?2:1) * width1 + 1;
			if(data.length < h.height * stride7) throw "Not enough data";
			var _g22 = 0;
			var _g112 = h.height;
			while(_g22 < _g112) {
				var y2 = _g22++;
				var f2 = data.get(r++);
				switch(f2) {
				case 0:
					if(alpha1) {
						var _g3 = 0;
						while(_g3 < width1) {
							var x10 = _g3++;
							var v1 = data.get(r++);
							bgra.set(w++,v1);
							bgra.set(w++,v1);
							bgra.set(w++,v1);
							bgra.set(w++,data.get(r++));
						}
					} else {
						var _g31 = 0;
						while(_g31 < width1) {
							var x11 = _g31++;
							var v2 = data.get(r++);
							bgra.set(w++,v2);
							bgra.set(w++,v2);
							bgra.set(w++,v2);
							bgra.set(w++,255);
						}
					}
					break;
				case 1:
					var cv = 0;
					var ca6 = 0;
					if(alpha1) {
						var _g32 = 0;
						while(_g32 < width1) {
							var x12 = _g32++;
							cv += data.get(r++);
							bgra.set(w++,cv);
							bgra.set(w++,cv);
							bgra.set(w++,cv);
							ca6 += data.get(r++);
							bgra.set(w++,ca6);
						}
					} else {
						var _g33 = 0;
						while(_g33 < width1) {
							var x13 = _g33++;
							cv += data.get(r++);
							bgra.set(w++,cv);
							bgra.set(w++,cv);
							bgra.set(w++,cv);
							bgra.set(w++,255);
						}
					}
					break;
				case 2:
					var stride8;
					if(y2 == 0) stride8 = 0; else stride8 = width1 * 4;
					if(alpha1) {
						var _g34 = 0;
						while(_g34 < width1) {
							var x14 = _g34++;
							var v3 = data.get(r++) + bgra.b[w - stride8];
							bgra.set(w++,v3);
							bgra.set(w++,v3);
							bgra.set(w++,v3);
							bgra.set(w++,data.get(r++) + bgra.b[w - stride8]);
						}
					} else {
						var _g35 = 0;
						while(_g35 < width1) {
							var x15 = _g35++;
							var v4 = data.get(r++) + bgra.b[w - stride8];
							bgra.set(w++,v4);
							bgra.set(w++,v4);
							bgra.set(w++,v4);
							bgra.set(w++,255);
						}
					}
					break;
				case 3:
					var cv1 = 0;
					var ca7 = 0;
					var stride9;
					if(y2 == 0) stride9 = 0; else stride9 = width1 * 4;
					if(alpha1) {
						var _g36 = 0;
						while(_g36 < width1) {
							var x16 = _g36++;
							cv1 = data.get(r++) + (cv1 + bgra.b[w - stride9] >> 1) & 255;
							bgra.set(w++,cv1);
							bgra.set(w++,cv1);
							bgra.set(w++,cv1);
							ca7 = data.get(r++) + (ca7 + bgra.b[w - stride9] >> 1) & 255;
							bgra.set(w++,ca7);
						}
					} else {
						var _g37 = 0;
						while(_g37 < width1) {
							var x17 = _g37++;
							cv1 = data.get(r++) + (cv1 + bgra.b[w - stride9] >> 1) & 255;
							bgra.set(w++,cv1);
							bgra.set(w++,cv1);
							bgra.set(w++,cv1);
							bgra.set(w++,255);
						}
					}
					break;
				case 4:
					var stride10 = width1 * 4;
					var cv2 = 0;
					var ca8 = 0;
					if(alpha1) {
						var _g38 = 0;
						while(_g38 < width1) {
							var x18 = _g38++;
							cv2 = format_png_Tools.filter(bgra,x18,y2,stride10,cv2,w,null) + data.get(r++) & 255;
							bgra.set(w++,cv2);
							bgra.set(w++,cv2);
							bgra.set(w++,cv2);
							ca8 = format_png_Tools.filter(bgra,x18,y2,stride10,ca8,w,null) + data.get(r++) & 255;
							bgra.set(w++,ca8);
						}
					} else {
						var _g39 = 0;
						while(_g39 < width1) {
							var x19 = _g39++;
							cv2 = format_png_Tools.filter(bgra,x19,y2,stride10,cv2,w,null) + data.get(r++) & 255;
							bgra.set(w++,cv2);
							bgra.set(w++,cv2);
							bgra.set(w++,cv2);
							bgra.set(w++,255);
						}
					}
					break;
				default:
					throw "Invalid filter " + f2;
				}
			}
			break;
		case 1:
			var alpha3 = _g[2];
			if(h.colbits != 8) throw "Unsupported color mode";
			var width2 = h.width;
			var stride11;
			stride11 = (alpha3?4:3) * width2 + 1;
			if(data.length < h.height * stride11) throw "Not enough data";
			var _g23 = 0;
			var _g113 = h.height;
			while(_g23 < _g113) {
				var y3 = _g23++;
				var f3 = data.get(r++);
				switch(f3) {
				case 0:
					if(alpha3) {
						var _g310 = 0;
						while(_g310 < width2) {
							var x20 = _g310++;
							bgra.set(w++,data.b[r + 2]);
							bgra.set(w++,data.b[r + 1]);
							bgra.set(w++,data.b[r]);
							bgra.set(w++,data.b[r + 3]);
							r += 4;
						}
					} else {
						var _g311 = 0;
						while(_g311 < width2) {
							var x21 = _g311++;
							bgra.set(w++,data.b[r + 2]);
							bgra.set(w++,data.b[r + 1]);
							bgra.set(w++,data.b[r]);
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				case 1:
					var cr6 = 0;
					var cg6 = 0;
					var cb6 = 0;
					var ca9 = 0;
					if(alpha3) {
						var _g312 = 0;
						while(_g312 < width2) {
							var x22 = _g312++;
							cb6 += data.b[r + 2];
							bgra.set(w++,cb6);
							cg6 += data.b[r + 1];
							bgra.set(w++,cg6);
							cr6 += data.b[r];
							bgra.set(w++,cr6);
							ca9 += data.b[r + 3];
							bgra.set(w++,ca9);
							r += 4;
						}
					} else {
						var _g313 = 0;
						while(_g313 < width2) {
							var x23 = _g313++;
							cb6 += data.b[r + 2];
							bgra.set(w++,cb6);
							cg6 += data.b[r + 1];
							bgra.set(w++,cg6);
							cr6 += data.b[r];
							bgra.set(w++,cr6);
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				case 2:
					var stride12;
					if(y3 == 0) stride12 = 0; else stride12 = width2 * 4;
					if(alpha3) {
						var _g314 = 0;
						while(_g314 < width2) {
							var x24 = _g314++;
							bgra.b[w] = data.b[r + 2] + bgra.b[w - stride12] & 255;
							w++;
							bgra.b[w] = data.b[r + 1] + bgra.b[w - stride12] & 255;
							w++;
							bgra.b[w] = data.b[r] + bgra.b[w - stride12] & 255;
							w++;
							bgra.b[w] = data.b[r + 3] + bgra.b[w - stride12] & 255;
							w++;
							r += 4;
						}
					} else {
						var _g315 = 0;
						while(_g315 < width2) {
							var x25 = _g315++;
							bgra.b[w] = data.b[r + 2] + bgra.b[w - stride12] & 255;
							w++;
							bgra.b[w] = data.b[r + 1] + bgra.b[w - stride12] & 255;
							w++;
							bgra.b[w] = data.b[r] + bgra.b[w - stride12] & 255;
							w++;
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				case 3:
					var cr7 = 0;
					var cg7 = 0;
					var cb7 = 0;
					var ca10 = 0;
					var stride13;
					if(y3 == 0) stride13 = 0; else stride13 = width2 * 4;
					if(alpha3) {
						var _g316 = 0;
						while(_g316 < width2) {
							var x26 = _g316++;
							cb7 = data.b[r + 2] + (cb7 + bgra.b[w - stride13] >> 1) & 255;
							bgra.set(w++,cb7);
							cg7 = data.b[r + 1] + (cg7 + bgra.b[w - stride13] >> 1) & 255;
							bgra.set(w++,cg7);
							cr7 = data.b[r] + (cr7 + bgra.b[w - stride13] >> 1) & 255;
							bgra.set(w++,cr7);
							ca10 = data.b[r + 3] + (ca10 + bgra.b[w - stride13] >> 1) & 255;
							bgra.set(w++,ca10);
							r += 4;
						}
					} else {
						var _g317 = 0;
						while(_g317 < width2) {
							var x27 = _g317++;
							cb7 = data.b[r + 2] + (cb7 + bgra.b[w - stride13] >> 1) & 255;
							bgra.set(w++,cb7);
							cg7 = data.b[r + 1] + (cg7 + bgra.b[w - stride13] >> 1) & 255;
							bgra.set(w++,cg7);
							cr7 = data.b[r] + (cr7 + bgra.b[w - stride13] >> 1) & 255;
							bgra.set(w++,cr7);
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				case 4:
					var stride14 = width2 * 4;
					var cr8 = 0;
					var cg8 = 0;
					var cb8 = 0;
					var ca11 = 0;
					if(alpha3) {
						var _g318 = 0;
						while(_g318 < width2) {
							var x28 = _g318++;
							cb8 = format_png_Tools.filter(bgra,x28,y3,stride14,cb8,w,null) + data.b[r + 2] & 255;
							bgra.set(w++,cb8);
							cg8 = format_png_Tools.filter(bgra,x28,y3,stride14,cg8,w,null) + data.b[r + 1] & 255;
							bgra.set(w++,cg8);
							cr8 = format_png_Tools.filter(bgra,x28,y3,stride14,cr8,w,null) + data.b[r] & 255;
							bgra.set(w++,cr8);
							ca11 = format_png_Tools.filter(bgra,x28,y3,stride14,ca11,w,null) + data.b[r + 3] & 255;
							bgra.set(w++,ca11);
							r += 4;
						}
					} else {
						var _g319 = 0;
						while(_g319 < width2) {
							var x29 = _g319++;
							cb8 = format_png_Tools.filter(bgra,x29,y3,stride14,cb8,w,null) + data.b[r + 2] & 255;
							bgra.set(w++,cb8);
							cg8 = format_png_Tools.filter(bgra,x29,y3,stride14,cg8,w,null) + data.b[r + 1] & 255;
							bgra.set(w++,cg8);
							cr8 = format_png_Tools.filter(bgra,x29,y3,stride14,cr8,w,null) + data.b[r] & 255;
							bgra.set(w++,cr8);
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				default:
					throw "Invalid filter " + f3;
				}
			}
			break;
		}
	}
	return bgra;
};
format_png_Tools.buildGrey = function(width,height,data) {
	var rgb = haxe_io_Bytes.alloc(width * height + height);
	var w = 0;
	var r = 0;
	var _g = 0;
	while(_g < height) {
		var y = _g++;
		rgb.set(w++,0);
		var _g1 = 0;
		while(_g1 < width) {
			var x = _g1++;
			rgb.set(w++,data.get(r++));
		}
	}
	var l = new List();
	l.add(format_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : format_png_Color.ColGrey(false), interlaced : false}));
	l.add(format_png_Chunk.CData(format_tools_Deflate.run(rgb)));
	l.add(format_png_Chunk.CEnd);
	return l;
};
format_png_Tools.buildRGB = function(width,height,data) {
	var rgb = haxe_io_Bytes.alloc(width * height * 3 + height);
	var w = 0;
	var r = 0;
	var _g = 0;
	while(_g < height) {
		var y = _g++;
		rgb.set(w++,0);
		var _g1 = 0;
		while(_g1 < width) {
			var x = _g1++;
			rgb.set(w++,data.b[r + 2]);
			rgb.set(w++,data.b[r + 1]);
			rgb.set(w++,data.b[r]);
			r += 3;
		}
	}
	var l = new List();
	l.add(format_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : format_png_Color.ColTrue(false), interlaced : false}));
	l.add(format_png_Chunk.CData(format_tools_Deflate.run(rgb)));
	l.add(format_png_Chunk.CEnd);
	return l;
};
format_png_Tools.build32ARGB = function(width,height,data) {
	var rgba = haxe_io_Bytes.alloc(width * height * 4 + height);
	var w = 0;
	var r = 0;
	var _g = 0;
	while(_g < height) {
		var y = _g++;
		rgba.set(w++,0);
		var _g1 = 0;
		while(_g1 < width) {
			var x = _g1++;
			rgba.set(w++,data.b[r + 1]);
			rgba.set(w++,data.b[r + 2]);
			rgba.set(w++,data.b[r + 3]);
			rgba.set(w++,data.b[r]);
			r += 4;
		}
	}
	var l = new List();
	l.add(format_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : format_png_Color.ColTrue(true), interlaced : false}));
	l.add(format_png_Chunk.CData(format_tools_Deflate.run(rgba)));
	l.add(format_png_Chunk.CEnd);
	return l;
};
format_png_Tools.build32BGRA = function(width,height,data) {
	var rgba = haxe_io_Bytes.alloc(width * height * 4 + height);
	var w = 0;
	var r = 0;
	var _g = 0;
	while(_g < height) {
		var y = _g++;
		rgba.set(w++,0);
		var _g1 = 0;
		while(_g1 < width) {
			var x = _g1++;
			rgba.set(w++,data.b[r + 2]);
			rgba.set(w++,data.b[r + 1]);
			rgba.set(w++,data.b[r]);
			rgba.set(w++,data.b[r + 3]);
			r += 4;
		}
	}
	var l = new List();
	l.add(format_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : format_png_Color.ColTrue(true), interlaced : false}));
	l.add(format_png_Chunk.CData(format_tools_Deflate.run(rgba)));
	l.add(format_png_Chunk.CEnd);
	return l;
};
var format_tools_Adler32 = function() {
	this.a1 = 1;
	this.a2 = 0;
};
format_tools_Adler32.__name__ = true;
format_tools_Adler32.read = function(i) {
	var a = new format_tools_Adler32();
	var a2a = i.readByte();
	var a2b = i.readByte();
	var a1a = i.readByte();
	var a1b = i.readByte();
	a.a1 = a1a << 8 | a1b;
	a.a2 = a2a << 8 | a2b;
	return a;
};
format_tools_Adler32.prototype = {
	update: function(b,pos,len) {
		var a1 = this.a1;
		var a2 = this.a2;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var p = _g1++;
			var c = b.b[p];
			a1 = (a1 + c) % 65521;
			a2 = (a2 + a1) % 65521;
		}
		this.a1 = a1;
		this.a2 = a2;
	}
	,equals: function(a) {
		return a.a1 == this.a1 && a.a2 == this.a2;
	}
	,__class__: format_tools_Adler32
};
var format_tools_Deflate = function() { };
format_tools_Deflate.__name__ = true;
format_tools_Deflate.run = function(b) {
	throw "Deflate is not supported on this platform";
	return null;
};
var format_tools_Huffman = { __ename__ : true, __constructs__ : ["Found","NeedBit","NeedBits"] };
format_tools_Huffman.Found = function(i) { var $x = ["Found",0,i]; $x.__enum__ = format_tools_Huffman; return $x; };
format_tools_Huffman.NeedBit = function(left,right) { var $x = ["NeedBit",1,left,right]; $x.__enum__ = format_tools_Huffman; return $x; };
format_tools_Huffman.NeedBits = function(n,table) { var $x = ["NeedBits",2,n,table]; $x.__enum__ = format_tools_Huffman; return $x; };
var format_tools_HuffTools = function() {
};
format_tools_HuffTools.__name__ = true;
format_tools_HuffTools.prototype = {
	treeDepth: function(t) {
		switch(t[1]) {
		case 0:
			return 0;
		case 2:
			throw "assert";
			break;
		case 1:
			var b = t[3];
			var a = t[2];
			var da = this.treeDepth(a);
			var db = this.treeDepth(b);
			return 1 + (da < db?da:db);
		}
	}
	,treeCompress: function(t) {
		var d = this.treeDepth(t);
		if(d == 0) return t;
		if(d == 1) switch(t[1]) {
		case 1:
			var b = t[3];
			var a = t[2];
			return format_tools_Huffman.NeedBit(this.treeCompress(a),this.treeCompress(b));
		default:
			throw "assert";
		}
		var size = 1 << d;
		var table = [];
		var _g = 0;
		while(_g < size) {
			var i = _g++;
			table.push(format_tools_Huffman.Found(-1));
		}
		this.treeWalk(table,0,0,d,t);
		return format_tools_Huffman.NeedBits(d,table);
	}
	,treeWalk: function(table,p,cd,d,t) {
		switch(t[1]) {
		case 1:
			var b = t[3];
			var a = t[2];
			if(d > 0) {
				this.treeWalk(table,p,cd + 1,d - 1,a);
				this.treeWalk(table,p | 1 << cd,cd + 1,d - 1,b);
			} else table[p] = this.treeCompress(t);
			break;
		default:
			table[p] = this.treeCompress(t);
		}
	}
	,treeMake: function(bits,maxbits,v,len) {
		if(len > maxbits) throw "Invalid huffman";
		var idx = v << 5 | len;
		if(bits.h.hasOwnProperty(idx)) return format_tools_Huffman.Found(bits.h[idx]);
		v <<= 1;
		len += 1;
		return format_tools_Huffman.NeedBit(this.treeMake(bits,maxbits,v,len),this.treeMake(bits,maxbits,v | 1,len));
	}
	,make: function(lengths,pos,nlengths,maxbits) {
		var counts = [];
		var tmp = [];
		if(maxbits > 32) throw "Invalid huffman";
		var _g = 0;
		while(_g < maxbits) {
			var i = _g++;
			counts.push(0);
			tmp.push(0);
		}
		var _g1 = 0;
		while(_g1 < nlengths) {
			var i1 = _g1++;
			var p = lengths[i1 + pos];
			if(p >= maxbits) throw "Invalid huffman";
			counts[p]++;
		}
		var code = 0;
		var _g11 = 1;
		var _g2 = maxbits - 1;
		while(_g11 < _g2) {
			var i2 = _g11++;
			code = code + counts[i2] << 1;
			tmp[i2] = code;
		}
		var bits = new haxe_ds_IntMap();
		var _g3 = 0;
		while(_g3 < nlengths) {
			var i3 = _g3++;
			var l = lengths[i3 + pos];
			if(l != 0) {
				var n = tmp[l - 1];
				tmp[l - 1] = n + 1;
				bits.h[n << 5 | l] = i3;
			}
		}
		return this.treeCompress(format_tools_Huffman.NeedBit(this.treeMake(bits,maxbits,0,1),this.treeMake(bits,maxbits,1,1)));
	}
	,__class__: format_tools_HuffTools
};
var format_tools_Inflate = function() { };
format_tools_Inflate.__name__ = true;
format_tools_Inflate.run = function(bytes) {
	return format_tools_InflateImpl.run(new haxe_io_BytesInput(bytes));
};
var format_tools__$InflateImpl_Window = function(hasCrc) {
	this.buffer = haxe_io_Bytes.alloc(65536);
	this.pos = 0;
	if(hasCrc) this.crc = new format_tools_Adler32();
};
format_tools__$InflateImpl_Window.__name__ = true;
format_tools__$InflateImpl_Window.prototype = {
	slide: function() {
		if(this.crc != null) this.crc.update(this.buffer,0,32768);
		var b = haxe_io_Bytes.alloc(65536);
		this.pos -= 32768;
		b.blit(0,this.buffer,32768,this.pos);
		this.buffer = b;
	}
	,addBytes: function(b,p,len) {
		if(this.pos + len > 65536) this.slide();
		this.buffer.blit(this.pos,b,p,len);
		this.pos += len;
	}
	,addByte: function(c) {
		if(this.pos == 65536) this.slide();
		this.buffer.b[this.pos] = c & 255;
		this.pos++;
	}
	,getLastChar: function() {
		return this.buffer.b[this.pos - 1];
	}
	,available: function() {
		return this.pos;
	}
	,checksum: function() {
		if(this.crc != null) this.crc.update(this.buffer,0,this.pos);
		return this.crc;
	}
	,__class__: format_tools__$InflateImpl_Window
};
var format_tools__$InflateImpl_State = { __ename__ : true, __constructs__ : ["Head","Block","CData","Flat","Crc","Dist","DistOne","Done"] };
format_tools__$InflateImpl_State.Head = ["Head",0];
format_tools__$InflateImpl_State.Head.__enum__ = format_tools__$InflateImpl_State;
format_tools__$InflateImpl_State.Block = ["Block",1];
format_tools__$InflateImpl_State.Block.__enum__ = format_tools__$InflateImpl_State;
format_tools__$InflateImpl_State.CData = ["CData",2];
format_tools__$InflateImpl_State.CData.__enum__ = format_tools__$InflateImpl_State;
format_tools__$InflateImpl_State.Flat = ["Flat",3];
format_tools__$InflateImpl_State.Flat.__enum__ = format_tools__$InflateImpl_State;
format_tools__$InflateImpl_State.Crc = ["Crc",4];
format_tools__$InflateImpl_State.Crc.__enum__ = format_tools__$InflateImpl_State;
format_tools__$InflateImpl_State.Dist = ["Dist",5];
format_tools__$InflateImpl_State.Dist.__enum__ = format_tools__$InflateImpl_State;
format_tools__$InflateImpl_State.DistOne = ["DistOne",6];
format_tools__$InflateImpl_State.DistOne.__enum__ = format_tools__$InflateImpl_State;
format_tools__$InflateImpl_State.Done = ["Done",7];
format_tools__$InflateImpl_State.Done.__enum__ = format_tools__$InflateImpl_State;
var format_tools_InflateImpl = function(i,header,crc) {
	if(crc == null) crc = true;
	if(header == null) header = true;
	this["final"] = false;
	this.htools = new format_tools_HuffTools();
	this.huffman = this.buildFixedHuffman();
	this.huffdist = null;
	this.len = 0;
	this.dist = 0;
	if(header) this.state = format_tools__$InflateImpl_State.Head; else this.state = format_tools__$InflateImpl_State.Block;
	this.input = i;
	this.bits = 0;
	this.nbits = 0;
	this.needed = 0;
	this.output = null;
	this.outpos = 0;
	this.lengths = [];
	var _g = 0;
	while(_g < 19) {
		var i1 = _g++;
		this.lengths.push(-1);
	}
	this.window = new format_tools__$InflateImpl_Window(crc);
};
format_tools_InflateImpl.__name__ = true;
format_tools_InflateImpl.run = function(i,bufsize) {
	if(bufsize == null) bufsize = 65536;
	var buf = haxe_io_Bytes.alloc(bufsize);
	var output = new haxe_io_BytesBuffer();
	var inflate = new format_tools_InflateImpl(i);
	while(true) {
		var len = inflate.readBytes(buf,0,bufsize);
		output.addBytes(buf,0,len);
		if(len < bufsize) break;
	}
	return output.getBytes();
};
format_tools_InflateImpl.prototype = {
	buildFixedHuffman: function() {
		if(format_tools_InflateImpl.FIXED_HUFFMAN != null) return format_tools_InflateImpl.FIXED_HUFFMAN;
		var a = [];
		var _g = 0;
		while(_g < 288) {
			var n = _g++;
			a.push(n <= 143?8:n <= 255?9:n <= 279?7:8);
		}
		format_tools_InflateImpl.FIXED_HUFFMAN = this.htools.make(a,0,288,10);
		return format_tools_InflateImpl.FIXED_HUFFMAN;
	}
	,readBytes: function(b,pos,len) {
		this.needed = len;
		this.outpos = pos;
		this.output = b;
		if(len > 0) while(this.inflateLoop()) {
		}
		return len - this.needed;
	}
	,getBits: function(n) {
		while(this.nbits < n) {
			this.bits |= this.input.readByte() << this.nbits;
			this.nbits += 8;
		}
		var b = this.bits & (1 << n) - 1;
		this.nbits -= n;
		this.bits >>= n;
		return b;
	}
	,getBit: function() {
		if(this.nbits == 0) {
			this.nbits = 8;
			this.bits = this.input.readByte();
		}
		var b = (this.bits & 1) == 1;
		this.nbits--;
		this.bits >>= 1;
		return b;
	}
	,getRevBits: function(n) {
		if(n == 0) return 0; else if(this.getBit()) return 1 << n - 1 | this.getRevBits(n - 1); else return this.getRevBits(n - 1);
	}
	,resetBits: function() {
		this.bits = 0;
		this.nbits = 0;
	}
	,addBytes: function(b,p,len) {
		this.window.addBytes(b,p,len);
		this.output.blit(this.outpos,b,p,len);
		this.needed -= len;
		this.outpos += len;
	}
	,addByte: function(b) {
		this.window.addByte(b);
		this.output.b[this.outpos] = b & 255;
		this.needed--;
		this.outpos++;
	}
	,addDistOne: function(n) {
		var c = this.window.getLastChar();
		var _g = 0;
		while(_g < n) {
			var i = _g++;
			this.addByte(c);
		}
	}
	,addDist: function(d,len) {
		this.addBytes(this.window.buffer,this.window.pos - d,len);
	}
	,applyHuffman: function(h) {
		switch(h[1]) {
		case 0:
			var n = h[2];
			return n;
		case 1:
			var b = h[3];
			var a = h[2];
			return this.applyHuffman(this.getBit()?b:a);
		case 2:
			var tbl = h[3];
			var n1 = h[2];
			return this.applyHuffman(tbl[this.getBits(n1)]);
		}
	}
	,inflateLengths: function(a,max) {
		var i = 0;
		var prev = 0;
		while(i < max) {
			var n = this.applyHuffman(this.huffman);
			switch(n) {
			case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:
				prev = n;
				a[i] = n;
				i++;
				break;
			case 16:
				var end = i + 3 + this.getBits(2);
				if(end > max) throw "Invalid data";
				while(i < end) {
					a[i] = prev;
					i++;
				}
				break;
			case 17:
				i += 3 + this.getBits(3);
				if(i > max) throw "Invalid data";
				break;
			case 18:
				i += 11 + this.getBits(7);
				if(i > max) throw "Invalid data";
				break;
			default:
				throw "Invalid data";
			}
		}
	}
	,inflateLoop: function() {
		var _g = this.state;
		switch(_g[1]) {
		case 0:
			var cmf = this.input.readByte();
			var cm = cmf & 15;
			var cinfo = cmf >> 4;
			if(cm != 8) throw "Invalid data";
			var flg = this.input.readByte();
			var fdict = (flg & 32) != 0;
			if(((cmf << 8) + flg) % 31 != 0) throw "Invalid data";
			if(fdict) throw "Unsupported dictionary";
			this.state = format_tools__$InflateImpl_State.Block;
			return true;
		case 4:
			var calc = this.window.checksum();
			if(calc == null) {
				this.state = format_tools__$InflateImpl_State.Done;
				return true;
			}
			var crc = format_tools_Adler32.read(this.input);
			if(!calc.equals(crc)) throw "Invalid CRC";
			this.state = format_tools__$InflateImpl_State.Done;
			return true;
		case 7:
			return false;
		case 1:
			this["final"] = this.getBit();
			var _g1 = this.getBits(2);
			switch(_g1) {
			case 0:
				this.len = this.input.readUInt16();
				var nlen = this.input.readUInt16();
				if(nlen != 65535 - this.len) throw "Invalid data";
				this.state = format_tools__$InflateImpl_State.Flat;
				var r = this.inflateLoop();
				this.resetBits();
				return r;
			case 1:
				this.huffman = this.buildFixedHuffman();
				this.huffdist = null;
				this.state = format_tools__$InflateImpl_State.CData;
				return true;
			case 2:
				var hlit = this.getBits(5) + 257;
				var hdist = this.getBits(5) + 1;
				var hclen = this.getBits(4) + 4;
				var _g2 = 0;
				while(_g2 < hclen) {
					var i = _g2++;
					this.lengths[format_tools_InflateImpl.CODE_LENGTHS_POS[i]] = this.getBits(3);
				}
				var _g21 = hclen;
				while(_g21 < 19) {
					var i1 = _g21++;
					this.lengths[format_tools_InflateImpl.CODE_LENGTHS_POS[i1]] = 0;
				}
				this.huffman = this.htools.make(this.lengths,0,19,8);
				var lengths = [];
				var _g3 = 0;
				var _g22 = hlit + hdist;
				while(_g3 < _g22) {
					var i2 = _g3++;
					lengths.push(0);
				}
				this.inflateLengths(lengths,hlit + hdist);
				this.huffdist = this.htools.make(lengths,hlit,hdist,16);
				this.huffman = this.htools.make(lengths,0,hlit,16);
				this.state = format_tools__$InflateImpl_State.CData;
				return true;
			default:
				throw "Invalid data";
			}
			break;
		case 3:
			var rlen;
			if(this.len < this.needed) rlen = this.len; else rlen = this.needed;
			var bytes = this.input.read(rlen);
			this.len -= rlen;
			this.addBytes(bytes,0,rlen);
			if(this.len == 0) if(this["final"]) this.state = format_tools__$InflateImpl_State.Crc; else this.state = format_tools__$InflateImpl_State.Block;
			return this.needed > 0;
		case 6:
			var rlen1;
			if(this.len < this.needed) rlen1 = this.len; else rlen1 = this.needed;
			this.addDistOne(rlen1);
			this.len -= rlen1;
			if(this.len == 0) this.state = format_tools__$InflateImpl_State.CData;
			return this.needed > 0;
		case 5:
			while(this.len > 0 && this.needed > 0) {
				var rdist;
				if(this.len < this.dist) rdist = this.len; else rdist = this.dist;
				var rlen2;
				if(this.needed < rdist) rlen2 = this.needed; else rlen2 = rdist;
				this.addDist(this.dist,rlen2);
				this.len -= rlen2;
			}
			if(this.len == 0) this.state = format_tools__$InflateImpl_State.CData;
			return this.needed > 0;
		case 2:
			var n = this.applyHuffman(this.huffman);
			if(n < 256) {
				this.addByte(n);
				return this.needed > 0;
			} else if(n == 256) {
				if(this["final"]) this.state = format_tools__$InflateImpl_State.Crc; else this.state = format_tools__$InflateImpl_State.Block;
				return true;
			} else {
				n -= 257;
				var extra_bits = format_tools_InflateImpl.LEN_EXTRA_BITS_TBL[n];
				if(extra_bits == -1) throw "Invalid data";
				this.len = format_tools_InflateImpl.LEN_BASE_VAL_TBL[n] + this.getBits(extra_bits);
				var dist_code;
				if(this.huffdist == null) dist_code = this.getRevBits(5); else dist_code = this.applyHuffman(this.huffdist);
				extra_bits = format_tools_InflateImpl.DIST_EXTRA_BITS_TBL[dist_code];
				if(extra_bits == -1) throw "Invalid data";
				this.dist = format_tools_InflateImpl.DIST_BASE_VAL_TBL[dist_code] + this.getBits(extra_bits);
				if(this.dist > this.window.available()) throw "Invalid data";
				if(this.dist == 1) this.state = format_tools__$InflateImpl_State.DistOne; else this.state = format_tools__$InflateImpl_State.Dist;
				return true;
			}
			break;
		}
	}
	,__class__: format_tools_InflateImpl
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = true;
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_Resource = function() { };
haxe_Resource.__name__ = true;
haxe_Resource.getBytes = function(name) {
	var _g = 0;
	var _g1 = haxe_Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		if(x.name == name) {
			if(x.str != null) return haxe_io_Bytes.ofString(x.str);
			return haxe_crypto_Base64.decode(x.data);
		}
	}
	return null;
};
var haxe_io_Bytes = function(b) {
	this.length = b.byteLength;
	this.b = new Uint8Array(b);
	b.hxBytes = this;
	b.bytes = b;
};
haxe_io_Bytes.__name__ = true;
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
haxe_io_Bytes.ofString = function(s) {
	var a = [];
	var i = 0;
	while(i < s.length) {
		var c = StringTools.fastCodeAt(s,i++);
		if(55296 <= c && c <= 56319) c = c - 55232 << 10 | StringTools.fastCodeAt(s,i++) & 1023;
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe_io_Bytes(new Uint8Array(a).buffer);
};
haxe_io_Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,blit: function(pos,src,srcpos,len) {
		if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe_io_Error.OutsideBounds;
		if(srcpos == 0 && len == src.length) this.b.set(src.b,pos); else this.b.set(src.b.subarray(srcpos,srcpos + len),pos);
	}
	,fill: function(pos,len,value) {
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.set(pos++,value);
		}
	}
	,getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe_io_Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.getString(0,this.length);
	}
	,__class__: haxe_io_Bytes
};
var haxe_crypto_Base64 = function() { };
haxe_crypto_Base64.__name__ = true;
haxe_crypto_Base64.decode = function(str,complement) {
	if(complement == null) complement = true;
	if(complement) while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	return new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES).decodeBytes(haxe_io_Bytes.ofString(str));
};
var haxe_crypto_BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) nbits++;
	if(nbits > 8 || len != 1 << nbits) throw "BaseCode : base length must be a power of two.";
	this.base = base;
	this.nbits = nbits;
};
haxe_crypto_BaseCode.__name__ = true;
haxe_crypto_BaseCode.prototype = {
	initTable: function() {
		var tbl = [];
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0;
		var _g2 = this.base.length;
		while(_g1 < _g2) {
			var i1 = _g1++;
			tbl[this.base.b[i1]] = i1;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) this.initTable();
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = haxe_io_Bytes.alloc(size);
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.get(pin++)];
				if(i == -1) throw "BaseCode : invalid encoded char";
				buf |= i;
			}
			curbits -= 8;
			out.set(pout++,buf >> curbits & 255);
		}
		return out;
	}
	,__class__: haxe_crypto_BaseCode
};
var haxe_crypto_Crc32 = function() {
	this.crc = -1;
};
haxe_crypto_Crc32.__name__ = true;
haxe_crypto_Crc32.prototype = {
	'byte': function(b) {
		var tmp = (this.crc ^ b) & 255;
		var _g = 0;
		while(_g < 8) {
			var j = _g++;
			if((tmp & 1) == 1) tmp = tmp >>> 1 ^ -306674912; else tmp >>>= 1;
		}
		this.crc = this.crc >>> 8 ^ tmp;
	}
	,update: function(b,pos,len) {
		var b1 = b.b.buffer;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			var tmp = (this.crc ^ b1.bytes[i]) & 255;
			var _g2 = 0;
			while(_g2 < 8) {
				var j = _g2++;
				if((tmp & 1) == 1) tmp = tmp >>> 1 ^ -306674912; else tmp >>>= 1;
			}
			this.crc = this.crc >>> 8 ^ tmp;
		}
	}
	,get: function() {
		return this.crc ^ -1;
	}
	,__class__: haxe_crypto_Crc32
};
var haxe_ds_IntMap = function() {
	this.h = { };
};
haxe_ds_IntMap.__name__ = true;
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
haxe_ds_IntMap.prototype = {
	__class__: haxe_ds_IntMap
};
var haxe_io_BytesBuffer = function() {
	this.b = [];
};
haxe_io_BytesBuffer.__name__ = true;
haxe_io_BytesBuffer.prototype = {
	add: function(src) {
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = 0;
		var _g = src.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,addBytes: function(src,pos,len) {
		if(pos < 0 || len < 0 || pos + len > src.length) throw haxe_io_Error.OutsideBounds;
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,getBytes: function() {
		var bytes = new haxe_io_Bytes(new Uint8Array(this.b).buffer);
		this.b = null;
		return bytes;
	}
	,__class__: haxe_io_BytesBuffer
};
var haxe_io_Input = function() { };
haxe_io_Input.__name__ = true;
haxe_io_Input.prototype = {
	readByte: function() {
		throw "Not implemented";
	}
	,readBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw haxe_io_Error.OutsideBounds;
		while(k > 0) {
			b[pos] = this.readByte();
			pos++;
			k--;
		}
		return len;
	}
	,set_bigEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,readFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.readBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,read: function(nbytes) {
		var s = haxe_io_Bytes.alloc(nbytes);
		var p = 0;
		while(nbytes > 0) {
			var k = this.readBytes(s,p,nbytes);
			if(k == 0) throw haxe_io_Error.Blocked;
			p += k;
			nbytes -= k;
		}
		return s;
	}
	,readUInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		if(this.bigEndian) return ch2 | ch1 << 8; else return ch1 | ch2 << 8;
	}
	,readInt32: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		if(this.bigEndian) return ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24; else return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
	,readString: function(len) {
		var b = haxe_io_Bytes.alloc(len);
		this.readFullBytes(b,0,len);
		return b.toString();
	}
	,__class__: haxe_io_Input
};
var haxe_io_BytesInput = function(b,pos,len) {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe_io_Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
	this.totlen = len;
};
haxe_io_BytesInput.__name__ = true;
haxe_io_BytesInput.__super__ = haxe_io_Input;
haxe_io_BytesInput.prototype = $extend(haxe_io_Input.prototype,{
	readByte: function() {
		if(this.len == 0) throw new haxe_io_Eof();
		this.len--;
		return this.b[this.pos++];
	}
	,readBytes: function(buf,pos,len) {
		if(pos < 0 || len < 0 || pos + len > buf.length) throw haxe_io_Error.OutsideBounds;
		if(this.len == 0 && len > 0) throw new haxe_io_Eof();
		if(this.len < len) len = this.len;
		var b1 = this.b;
		var b2 = buf.b;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b2[pos + i] = b1[this.pos + i];
		}
		this.pos += len;
		this.len -= len;
		return len;
	}
	,__class__: haxe_io_BytesInput
});
var haxe_io_Eof = function() {
};
haxe_io_Eof.__name__ = true;
haxe_io_Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe_io_Eof
};
var haxe_io_Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; return $x; };
var haxe_io_FPHelper = function() { };
haxe_io_FPHelper.__name__ = true;
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af;
	if(f < 0) af = -f; else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	if(typeof window != "undefined") return window[name]; else return global[name];
};
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
js_html_compat_ArrayBuffer.__name__ = true;
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw haxe_io_Error.OutsideBounds;
};
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
js_html_compat_Uint8Array.__name__ = true;
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw "TODO " + Std.string(arg1);
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw "set() outside of range";
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw "set() outside of range";
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw "TODO";
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
haxe_Resource.content = [{ name : "tiny.ui.png", data : "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"}];
var ArrayBuffer = typeof(window) != "undefined" && window.ArrayBuffer || typeof(global) != "undefined" && global.ArrayBuffer || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = typeof(window) != "undefined" && window.DataView || typeof(global) != "undefined" && global.DataView || js_html_compat_DataView;
var Uint8Array = typeof(window) != "undefined" && window.Uint8Array || typeof(global) != "undefined" && global.Uint8Array || js_html_compat_Uint8Array._new;
format_tools__$InflateImpl_Window.SIZE = 32768;
format_tools__$InflateImpl_Window.BUFSIZE = 65536;
format_tools_InflateImpl.LEN_EXTRA_BITS_TBL = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,-1,-1];
format_tools_InflateImpl.LEN_BASE_VAL_TBL = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
format_tools_InflateImpl.DIST_EXTRA_BITS_TBL = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,-1,-1];
format_tools_InflateImpl.DIST_BASE_VAL_TBL = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
format_tools_InflateImpl.CODE_LENGTHS_POS = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
haxe_crypto_Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe_crypto_Base64.BYTES = haxe_io_Bytes.ofString(haxe_crypto_Base64.CHARS);
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
Test.main();
})(typeof console != "undefined" ? console : {log:function(){}});
