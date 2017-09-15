#!/bin/sh
# author elwinxiao

if [ $# -eq 0 ]; then
	echo "usage: $0 <mode>"
	echo "  - d: download"
	echo "  - b: build"
	exit 1
fi
MODE=$1

SOURCE_DIR=ffmpeg_sources
PREFIX=$PWD/ffmpeg_build
export PKG_CONFIG_PATH=$PREFIX/lib/pkgconfig
export PATH=$PREFIX/bin:$PATH
export LD_LIBRARY_PATH=$PREFIX/lib

unpack() {
	local name=$1
	local ext=${name##*.}
	if [ "$ext" = "bz2" ]; then
		tar -jxf $name
	elif [ "$ext" = "xz" ]; then
		tar -Jxf $name
	elif [ "$ext" = "zip" ]; then
		unzip -o $name
		rm -rf __MACOSX 2>/dev/null
	elif [ "$ext" = "gz" -o "$ext" = "tgz" ]; then
		tar -zxf $name
	else
		tar -xf $name
	fi
}

retrieve() {
	local url=$1
	local name=${url##*/}
	echo "retrieve: $name"
	echo "downloading..."
	curl -OL $url
	echo "unpacking..."
	unpack $name
	rm $name
	echo ""
}


normalize_filename() {
	local prefix=$1
	local typ=${2:-f}
	local files=(`find . -maxdepth 1 -type $typ -iname "$prefix*"`)
	echo ${files[0]##*/}
}

retrieve_source() {
	local YASM_URL=http://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz
	local PYTHON_URL=https://www.python.org/ftp/python/2.7.13/Python-2.7.13.tgz
	local LIBXML2_URL=ftp://xmlsoft.org/libxml2/libxml2-2.9.5.tar.gz
	local GPERF_URL=http://ftp.gnu.org/pub/gnu/gperf/gperf-3.1.tar.gz
	local FONTCONFIG_URL=https://www.freedesktop.org/software/fontconfig/release/fontconfig-2.12.4.tar.gz
	local FRIBIDI_URL=https://www.fribidi.org/download/fribidi-0.19.7.tar.bz2
	local FREETYPE_URL=http://download.savannah.gnu.org/releases/freetype/freetype-2.8.tar.gz
	local LIBASS_URL=https://github.com/libass/libass/releases/download/0.13.7/libass-0.13.7.tar.gz
	local LIBX264_URL=ftp://ftp.videolan.org/pub/x264/snapshots/last_x264.tar.bz2
	local LIBX265_URL=https://bitbucket.org/multicoreware/x265/downloads/x265_2.5.tar.gz
	local FONT_URL=http://m2.pc6.com/xxj/weuruan.zip
	
	mkdir $SOURCE_DIR 2>/dev/null
	cd $SOURCE_DIR
	
	#retrieve $PYTHON_URL
	retrieve https://cmake.org/files/v3.9/cmake-3.9.2.tar.gz
	retrieve $YASM_URL
	retrieve http://www.nasm.us/pub/nasm/releasebuilds/2.13.01/nasm-2.13.01.tar.xz
	retrieve $LIBXML2_URL
	retrieve $GPERF_URL
	retrieve $FONTCONFIG_URL
	retrieve $FRIBIDI_URL
	retrieve $FREETYPE_URL
	retrieve $LIBASS_URL
	retrieve $LIBX264_URL
	retrieve $LIBX265_URL
	retrieve https://downloads.sourceforge.net/opencore-amr/fdk-aac-0.1.5.tar.gz
	retrieve http://downloads.sourceforge.net/project/lame/lame/3.99/lame-3.99.5.tar.gz
	retrieve https://archive.mozilla.org/pub/opus/opus-1.2.1.tar.gz
	retrieve http://downloads.xiph.org/releases/ogg/libogg-1.3.2.tar.gz
	retrieve http://downloads.xiph.org/releases/vorbis/libvorbis-1.3.5.tar.gz
	retrieve http://storage.googleapis.com/downloads.webmproject.org/releases/webm/libvpx-1.6.1.tar.bz2
	retrieve http://ffmpeg.org/releases/ffmpeg-3.3.3.tar.bz2
	retrieve $FONT_URL

	cd ..
	echo "create pack: $SOURCE_DIR.tar.bz2"
	tar -jcf $SOURCE_DIR.tar.bz2 $SOURCE_DIR
	echo "retrieve finished"
}


enter_artifact_dir() {
	local dir_prefix=$1
	local sourcedir=`normalize_filename $dir_prefix d`
	if [ ! -d "$sourcedir" ]; then
		echo "build $sourcedir failed, no suce directory here"
		exit 1
	fi

	echo "=== build $sourcedir to $PREFIX ==="
	LAST_DIR=$(pwd)
	cd $sourcedir
}

exit_artifact_dir() {
	cd $LAST_DIR
	#cd - >/dev/null
	echo ""
}

configure_artifact() {
	local options=$@
	local name=$(basename $(pwd))
	echo "configure $name: --prefix=$PREFIX $options"
	./configure --prefix=$PREFIX $options
	if [ $? -ne 0 ]; then 
		echo "configure $name failed"
		exit 1
	fi
}

make_artifact() {
	local name=$(basename $(pwd))
	echo "start make $name"
	make -j4
	if [ $? -ne 0 ]; then 
		echo "make $name failed"
		exit 1
	fi
}

install_artifact() {
	local name=$(basename $(pwd))
	echo "start install $name"
	make install
	if [ $? -ne 0 ]; then 
		echo "install $name failed"
		exit 1
	fi
}

build_install() {
	local dir_prefix=$1
	if [ $# -gt 1 ]; then
		local options=`echo $@ | cut -d' ' -f2-`
	fi

	enter_artifact_dir $dir_prefix
	configure_artifact $options
	make_artifact
	install_artifact
	exit_artifact_dir
}

build_install_cmake() {
	which cmake >/dev/null 2>&1
	if [ $? -eq 0 ]; then
		echo "skip build cmake already here"
		return 0
	fi

	enter_artifact_dir cmake

	sed -i '/CMAKE_USE_LIBUV 1/s/1/0/' CMakeLists.txt     &&
	sed -i '/"lib64"/s/64//' Modules/GNUInstallDirs.cmake &&
	./bootstrap --prefix=$PREFIX
	if [ $? -ne 0 ]; then 
		echo "configure cmake failed"
		exit 1
	fi

	make_artifact
	install_artifact
	exit_artifact_dir
}

build_install_x265() {
	enter_artifact_dir x265

	cd build/linux
	cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX=$PREFIX -DENABLE_SHARED:bool=off ../../source
	if [ $? -ne 0 ]; then 
		echo "cmake $sourcedir failed"
		exit 1
	fi

	make_artifact
	install_artifact
	exit_artifact_dir
}

build_install_ffmpeg() {
	enter_artifact_dir ffmpeg

	./configure --prefix=$PREFIX $options --extra-cflags="-I$PREFIX/include" --extra-ldflags="-L$PREFIX/lib -ldl" \
  		--pkg-config-flags="--static" \
  		--enable-gpl \
  		--enable-libfdk_aac \
  		--enable-libfreetype \
  		--enable-libmp3lame \
  		--enable-libopus \
  		--enable-libvorbis \
  		--enable-libvpx \
  		--enable-libx264 \
  		--enable-libx265 \
  		--enable-nonfree \
  		--enable-libass
	if [ $? -ne 0 ]; then 
		echo "configure $sourcedir failed"
		exit 1
	fi

	make_artifact
	install_artifact
	exit_artifact_dir
}

install_font() {
	local FONT_DIR=$HOME/.fonts
	find . -maxdepth 2 -name "*.ttf.zip" -exec unzip -o {} \;
	rm -rf __MACOSX 2>/dev/null
	mkdir $FONT_DIR 2>/dev/null
	find . -maxdepth 2 -name "*.ttf" -exec mv {} $FONT_DIR/ \;
}

build_source() {
	local tar_name=$(normalize_filename $SOURCE_DIR)
	echo "unpacking: $tar_name"
	unpack $tar_name

	if [ ! -d "$SOURCE_DIR" ]; then
		echo "build $SOURCE_DIR failed, no suce directory here"
		exit 1
	fi
	echo "start build dir $SOURCE_DIR"
	cd $SOURCE_DIR

	#build_install python
	build_install_cmake
	build_install yasm --disable-static
	build_install nasm
	build_install libxml2 --with-python=no #=$PREFIX
	build_install freetype --enable-static
	build_install gperf
	build_install fontconfig --enable-libxml2
	build_install fribidi --enable-static
	build_install libass --enable-static
	build_install x264 --enable-static
	build_install fdk-aac --disable-shared
	build_install lame --disable-shared --enable-nasm
	build_install opus --disable-shared
	build_install libogg --disable-shared
	build_install libvorbis --with-ogg=$PREFIX --disable-shared
	build_install libvpx --disable-examples --disable-unit-tests --enable-vp9-highbitdepth --as=yasm
	build_install_x265
	build_install_ffmpeg

	install_font
}

test_multiline_params() {
	configure_artifact "--extra-cflags=\"-I$PREFIX/include\" --extra-ldflags=\"-L$PREFIX/lib -ldl\" --pkg-config-flags=\"--static\"  --enable-gpl  --enable-libfdk_aac --enable-libfreetype --enable-libmp3lame --enable-libopus --enable-libvorbis --enable-libvpx --enable-libx264 --enable-libx265 --enable-nonfree --enable-libass"
}


if [ "$MODE" = "d" ]; then
	echo "# Download mode"
	retrieve_source
elif [ "$MODE" = "b" ]; then
	echo "# Build Mode"
	build_source
else
	echo "# Manual Mode"
fi




