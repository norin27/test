cat > install_wifite_deps.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

echo "== Installing dependencies for Wifite (reaver, bully, pyrit, tshark, hcxdumptool, hcxpcaptool, macchanger) =="
apt update
apt install -y --no-install-recommends build-essential git autoconf automake libtool pkg-config cmake python3 python3-pip python3-dev libssl-dev libcurl4-openssl-dev libpcap-dev libnl-3-dev libnl-genl-3-dev libsqlite3-dev ca-certificates wget unzip
apt install -y --no-install-recommends aircrack-ng macchanger wireshark-common tshark || true

if apt-cache policy pyrit | grep -q 'Candidate:'; then
    apt install -y pyrit || true
fi
if ! command -v pyrit >/dev/null 2>&1; then
    pip3 install pyrit || true
fi

build_from_git() {
    local repo_url="$1"
    local dir="$2"
    local build_cmds="$3"
    if [ -d "$dir" ]; then
        echo "Directory $dir already exists — skipping clone"
    else
        git clone --depth 1 "$repo_url" "$dir"
    fi
    pushd "$dir" >/dev/null
    eval "$build_cmds"
    popd >/dev/null
}

if ! command -v reaver >/dev/null 2>&1; then
    build_from_git "https://github.com/t6x/reaver-wps-fork-t6x.git" "reaver-wps-fork-t6x" "./configure --prefix=/usr && make -j\$(nproc) && make install" || true
fi

if ! command -v bully >/dev/null 2>&1; then
    build_from_git "https://github.com/aanarchyy/bully.git" "bully" "autoreconf -i || true; ./configure --prefix=/usr || true; make -j\$(nproc) || make; make install || true" || true
fi

if ! command -v hcxpcaptool >/dev/null 2>&1; then
    build_from_git "https://github.com/ZerBea/hcxtools.git" "hcxtools" "make -j\$(nproc) && make install" || true
fi

if ! command -v hcxdumptool >/dev/null 2>&1; then
    build_from_git "https://github.com/ZerBea/hcxdumptool.git" "hcxdumptool" "make -j\$(nproc) && make install" || true
fi

if ! command -v hashcat >/dev/null 2>&1; then
    apt install -y hashcat || true
fi

if ! command -v tshark >/dev/null 2>&1; then
    DEBIAN_FRONTEND=noninteractive apt install -y wireshark || true
fi

sudo ldconfig || true

for cmd in reaver bully pyrit tshark hcxdumptool hcxpcaptool macchanger hashcat; do
    if command -v "$cmd" >/dev/null 2>&1; then
        echo "  $cmd -> $(command -v $cmd)"
    else
        echo "  $cmd -> NOT FOUND"
    fi
done

EOF

chmod +x install_wifite_deps.sh
sudo ./install_wifite_deps.sh
