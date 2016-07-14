#!/usr/bin/env bash
#
#                  Dgraph Installer Script
#
#   Homepage: https://dgraph.io
#   Requires: bash, curl or wget, tar or unzip
#
# Hello! This is a script that installs Dgraph
# into your PATH (which may require password authorization).
# Use it like this:
#
#	$ curl https://get.dgraph.io | bash
#	 or
#	$ wget -qO- https://get.dgraph.io | bash
#
# This should work on Mac, Linux, and BSD systems.

set -e

BLACK='\033[30;1m'
RED='\033[91;1m'
GREEN='\033[32;1m'
RESET='\033[0m'

print_step() {
    printf "$BLACK$1$RESET\n"
}

print_error() {
    printf "$RED$1$RESET\n"
}

print_good() {
    printf "$GREEN$1$RESET\n"
}

install_dgraph() {

printf $GREEN
cat << "EOF"
  _____                        _
 |  __ \                      | |
 | |  | | __ _ _ __ __ _ _ __ | |__
 | |  | |/ _` | '__/ _` | '_ \| '_ \
 | |__| | (_| | | | (_| | |_) | | | |
 |_____/ \__, |_|  \__,_| .__/|_| |_|
          __/ |         | |
         |___/          |_|

EOF
printf $RESET

	sudo_cmd=""
	if hash sudo 2>/dev/null; then
		sudo_cmd="sudo"
	fi

	install_path="/usr/local/bin"

	if hash curl 2>/dev/null; then
		release_version="$(curl -s https://api.github.com/repos/dgraph-io/dgraph/releases | grep "tag_name" | awk '{print $2}' | tr -dc '[:alnum:].\n\r' | head -n1)"
	elif hash wget 2>/dev/null; then
		release_version="$(wget -qO- 2>&1 https://api.github.com/repos/dgraph-io/dgraph/releases | grep "tag_name" | awk '{print $2}' | tr -dc '[:alnum:].\n\r' | head -n1)"
	else
		print_error "Please install wget or curl to continue."
		exit 1
	fi

	tar_file=dgraph-"$(uname | tr '[:upper:]' '[:lower:]')"-amd64-$release_version".tar.gz"
	dgraph_link="https://github.com/dgraph-io/dgraph/releases/download/"$release_version"/"$tar_file

	# Backup existing dgraph binaries in HOME directory
	if hash dgraph 2>/dev/null; then
		dgraph_path="$(which dgraph)"
		dgraph_backup="dgraph_backup_olderversion"
		print_step "Backing up older versions in ~/$dgraph_backup (password may be required)."
		mkdir -p ~/$dgraph_backup
		$sudo_cmd mv $dgraph_path* ~/$dgraph_backup/.
	fi

	# Download and untar Dgraph binaries
	if hash wget 2>/dev/null; then
		print_step "Downloading $dgraph_link"
		if wget --progress=bar "$dgraph_link" -O "/tmp/$tar_file"; then
			print_good "Download complete."
		else
			print_error "Sorry. Binaries not available for your platform. Please compile manually: https://wiki.dgraph.io/Beginners_Guide"
			echo
			exit 1;
		fi
	elif hash curl 2>/dev/null; then
		if curl --output /dev/null --silent --head --fail "$dgraph_link"; then
			print_step "Downloading $dgraph_link"
			curl -L --progress-bar "$dgraph_link" -o "/tmp/$tar_file"
			print_good "Download complete."
		else
			print_error "Sorry. Binaries not available for your platform. Please compile manually: https://wiki.dgraph.io/Beginners_Guide";
			echo
			exit 1;
		fi
	else
		print_error "Could not find curl or wget.";
		exit 1 ;
	fi

	print_step "Inflating binaries (password may be required).";
	$sudo_cmd tar -C /usr/local/bin -xzf /tmp/$tar_file;
	rm "/tmp/"$tar_file;

	# Check installation
	if hash dgraph 2>/dev/null; then
		print_good "Dgraph binaries $release_version have been installed successfully in /usr/local/bin.";
		print_good "Please visit https://wiki.dgraph.io/Beginners_Guide for further instructions on usage."
		echo
		echo
		exit 0;
	else
		print_error "Installation failed. Please try again.";
		exit 1;
	fi
}

install_dgraph "$@"
