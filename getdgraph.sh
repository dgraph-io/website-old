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

install_dgraph() {
	echo "Hello from Dgraph!"
	
	sudo_cmd="sudo"
	install_path="/usr/local/bin"
	
	if [ -n "$(which curl)" ]; then
		release_version="$(curl -s https://api.github.com/repos/dgraph-io/dgraph/releases | grep "tag_name" | awk '{print $2}' | tr -dc '[:alnum:].\n\r' | head -n1)"
	elif [ -n "$(which wget)" ]; then
		release_version="$(wget -qO- 2>&1 https://api.github.com/repos/dgraph-io/dgraph/releases | grep "tag_name" | awk '{print $2}' | tr -dc '[:alnum:].\n\r' | head -n1)"
	else
		echo "Please install wget or curl to continue"
		exit 1
	fi

	tar_file=dgraph-"$(uname | tr '[:upper:]' '[:lower:]')"-amd64-$release_version".tar.gz"
	dgraph_link="https://github.com/dgraph-io/dgraph/releases/download/"$release_version"/"$tar_file

	# Backup existing dgraph binaries in HOME directory
	if hash dgraph 2>/dev/null; then
		dgraph_path="$(which dgraph)"
		dgraph_backup="dgraph_backup_olderversion"
		echo "Backing up older versions in ~/$dgraph_backup"
		mkdir -p ~/$dgraph_backup
		echo "(Password might be required.)"
		$sudo_cmd mv $dgraph_path* ~/$dgraph_backup/.
	fi

	# Download and untar Dgraph binaries
	if [ -n "$(which wget)" ]; then
		if ! wget -q --spider "$dgraph_link"; then
			echo "Downloading Dgraph from $dgraph_link"
			wget -q "$dgraph_link" -O "/tmp/$tar_file"
		else
			echo "Sorry. Binaries not available for your platform. Please compile manually: https://wiki.dgraph.io/Beginners_Guide"
		fi
	elif [ -n "$(which curl)" ]; then
		if curl --output /dev/null --silent --head --fail "$dgraph_link"; then
			echo "Downloading Dgraph from $dgraph_link"	
			curl -L --progress-bar "$dgraph_link" -o "/tmp/$tar_file"
		else
			echo "Sorry. Binaries not available for your platform. Please compile manually: https://wiki.dgraph.io/Beginners_Guide";
			exit 1;
		fi
	else
		echo "Could not find curl or wget";
		exit 1 ;
	fi

	echo "Inflating the binaries (Password required.)";
	$sudo_cmd tar -C /usr/local/bin -xzf /tmp/$tar_file;
	rm "/tmp/"$tar_file;

	# Check installation
	if hash dgraph 2>/dev/null; then
		echo "Voila! Dgraph $release_version has been installed successfully in /usr/local/bin";
		echo "Please visit https://wiki.dgraph.io/Beginners_Guide for further instructions on usage"
		dgraph --help;
		exit 0;
	else
		echo "Installation failed. Please try again";
		exit 1;
	fi	
}

install_dgraph "$@"
