git branch -D mirror
git branch -c mirror
git checkout mirror
git am --abort
git am -3 0001-Update-CNAME.patch
git checkout master
git push -f mirror mirror:master
