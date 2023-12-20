#!/bin/sh
#---------------------------------------------------------------
# Given an xxhdpi image or an App Icon (launcher), this script
# creates different dpis resources and the necessary folders
# if they don't exist
#
# Place this script, as well as the source image, inside res
# folder and execute it passing the image filename as argument
#
# Example:
# ./drawables_dpis_creation.sh ic_launcher.png
# OR
# ./drawables_dpis_creation.sh my_cool_xxhdpi_image.png
#
# Copyright (c) 2016 Ricardo Romao.
# This free software comes with ABSOLUTELY NO WARRANTY and
# is distributed under GNU GPL v3 license. 
#---------------------------------------------------------------


echo " Creating different dimensions (dips) of "$1" ..."
@REM mkdir -p drawable-xxxhdpi
@REM mkdir -p drawable-xxhdpi
@REM mkdir -p drawable-xhdpi
@REM mkdir -p drawable-hdpi
@REM mkdir -p drawable-mdpi

if [ $1 = "mapa.png" ]; then
    echo "  App icon detected"
    convert mapa.png -resize 144x144 mipmap-xxhdpi/ic_launcher.png
    convert mapa.png -resize 96x96 mipmap-xhdpi/ic_launcher.png
    convert mapa.png -resize 72x72 mipmap-hdpi/ic_launcher.png
    convert mapa.png -resize 48x48 mipmap-mdpi/ic_launcher.png
    @REM rm -i ic_launcher.png
    
fi
echo " Done"

fi
@echo off
pause