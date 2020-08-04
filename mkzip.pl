use warnings;
use strict;
use Net::GitHub::V3;
use IO::Compress::Zip qw(zip $ZipError) ;
use Time::Piece;
use Net::SSLeay;
use Data::Dumper;
use File::Slurp;

package Net::GitHub::V3::GitData;
__build_methods(__PACKAGE__,
    delete_ref => { url => "/repos/%s/%s/git/refs/%s", method => 'DELETE', args => 1, check_status => 204}
);
package main;
die "need github token" unless $ENV{GITHUB_ACCESS_TOKEN};


system('git push master master');
#async the git
system('start pushmirror.bat');
chdir 'docs';
my $dt = localtime;
my $tag = $dt->monname().'_'.$dt->mday().'_'.$dt->year();
my @files = qw (
client.js
index.html
thread.html
favicon.ico
);
zip \@files => ('..\wvoice_'.$tag.'.zip')
    or die "zip failed: $ZipError\n";



my $gh = Net::GitHub::V3->new(
access_token => $ENV{GITHUB_ACCESS_TOKEN},
);
my $repos = $gh->repos;
$repos->RaiseError(0);

# set :user/:repo for simple calls
$repos->set_default_user_repo('bulk88', 'whoglevoice');
my (@releases) = $repos->releases();
#delete same day tags from repushes/etc
foreach(@releases) {
    if($_->{name} eq $tag){
        my $r = $repos->delete_release($_->{id});
    }
}
my $git_data = $gh->git_data;
$git_data->set_default_user_repo('bulk88', 'whoglevoice');
my $response = $git_data->delete_ref('tags/'.$tag); #$response is integer 1
my $release = $repos->create_release({
  "tag_name" => $tag,
  "target_commitish" => "master",
  "name" => $tag,
  "body" => "Whogle Voice offline release",
});
if($release->{errors}) {
    print Dumper($release);
} else {
    my $text = read_file('..\wvoice_'.$tag.'.zip', { binmode => ':raw' });
    my $asset = $repos->upload_asset($release->{id}, 'wvoice_'.$tag.'.zip', 'application/zip', $text);
    if($asset->{errors}) {
        print Dumper($asset);
    }
}
print "Done Uploading Release Zips to GH\n";
