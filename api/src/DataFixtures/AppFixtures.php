<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Page;
use App\Entity\Post;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $admin = new User();
        $admin->setEmail('admin@psyched.local');
        $admin->setUsername('admin');
        $admin->setRoles(['ROLE_ADMIN']);
        $manager->persist($admin);

        $editor = new User();
        $editor->setEmail('editor@psyched.local');
        $editor->setUsername('editor');
        $editor->setRoles(['ROLE_EDITOR']);
        $manager->persist($editor);

        $genres = [];
        foreach (['psych-rock', 'doom', 'desert-rock'] as $slug) {
            $genres[$slug] = $this->getReference('genre-' . $slug, \App\Entity\Genre::class);
        }

        $posts = [
            ['welcome-to-psyched', 'Welcome to Psyched CMS', 'An introduction to building content with Psyched CMS.', '<p>Psyched CMS is a headless content management system built with API Platform and React Admin.</p>', $admin, ['psych-rock']],
            ['getting-started', 'Getting Started Guide', 'Everything you need to know to get up and running.', '<p>Follow these steps to set up your first project with Psyched CMS.</p>', $admin, ['desert-rock']],
            ['desert-sessions', 'Desert Sessions Vol. 1', 'A deep dive into the desert rock scene.', '<p>The desert rock scene emerged from Palm Desert in the early 1990s.</p>', $editor, ['desert-rock', 'psych-rock']],
            ['doom-and-gloom', 'Doom & Gloom', 'Exploring the heavier side of psychedelic music.', '<p>Doom metal takes the slow, heavy riffs of Black Sabbath to their logical extreme.</p>', $editor, ['doom']],
            ['fuzz-pedals-101', 'Fuzz Pedals 101', 'The essential guide to fuzz.', '<p>From the Maestro Fuzz-Tone to the Big Muff, fuzz pedals shaped rock history.</p>', $admin, []],
        ];

        foreach ($posts as [$slug, $title, $excerpt, $content, $author, $genreSlugs]) {
            $post = new Post();
            $post->setSlug($slug);
            $post->setTitle($title);
            $post->setExcerpt($excerpt);
            $post->setContent($content);
            $post->setAuthor($author);
            $post->setStatus('published');

            foreach ($genreSlugs as $gs) {
                $post->addGenre($genres[$gs]);
            }

            $manager->persist($post);
        }

        $pages = [
            ['about', 'About', '<p>Psyched CMS is an open-source headless CMS for music-oriented content.</p>', 'About Psyched CMS', 'An open-source headless CMS built with Symfony and React.'],
            ['contact', 'Contact', '<p>Get in touch at hello@psyched.local.</p>', 'Contact Us', 'Reach out to the Psyched CMS team.'],
            ['privacy-policy', 'Privacy Policy', '<p>We respect your privacy. This policy explains how we handle your data.</p>', 'Privacy Policy', 'How we handle your data.'],
        ];

        foreach ($pages as [$slug, $title, $content, $metaTitle, $metaDescription]) {
            $page = new Page();
            $page->setSlug($slug);
            $page->setTitle($title);
            $page->setContent($content);
            $page->setMetaTitle($metaTitle);
            $page->setMetaDescription($metaDescription);
            $page->setAuthor($admin);
            $page->setStatus('published');
            $manager->persist($page);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            TaxonomyFixtures::class,
        ];
    }
}
