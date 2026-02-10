<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Genre;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TaxonomyFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $rock = $this->createGenre('rock', 'Rock', 0);
        $manager->persist($rock);
        $this->addReference('genre-rock', $rock);

        $subgenres = [
            ['psych-rock', 'Psych Rock', 1],
            ['doom', 'Doom', 2],
            ['desert-rock', 'Desert Rock', 3],
            ['grunge', 'Grunge', 4],
        ];

        foreach ($subgenres as [$slug, $name, $order]) {
            $sub = $this->createGenre($slug, $name, $order);
            $sub->setParent($rock);
            $manager->persist($sub);
            $this->addReference('genre-' . $slug, $sub);
        }

        $manager->flush();
    }

    private function createGenre(string $slug, string $name, int $position): Genre
    {
        $genre = new Genre();
        $genre->setSlug($slug);
        $genre->setName($name);
        $genre->setTaxonomyTermPosition($position);

        return $genre;
    }
}
