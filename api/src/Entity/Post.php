<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\PostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use PsychedCms\Core\Attribute\ContentType;
use PsychedCms\Core\Attribute\Field\CollectionField;
use PsychedCms\Core\Attribute\Field\DateField;
use PsychedCms\Core\Attribute\Field\HtmlField;
use PsychedCms\Core\Attribute\Field\RelationField;
use PsychedCms\Core\Attribute\Field\TextareaField;
use PsychedCms\Core\Attribute\Field\TextField;
use PsychedCms\Core\Attribute\Field\UrlField;
use PsychedCms\Geolocation\Attribute\GeolocationField;
use PsychedCms\Core\Content\ContentTrait;
use PsychedCms\Core\Content\TranslatableInterface;
use PsychedCms\Core\Content\TranslatableTrait;
use PsychedCms\Media\Attribute\ImageField;
use PsychedCms\Media\Entity\Media;
use PsychedCms\Taxonomy\Attribute\EntityTaxonomyField;
use PsychedCms\Taxonomy\Attribute\TaxonomyField;
use PsychedCms\Taxonomy\Entity\Taxonomy;
use PsychedCms\Taxonomy\Filter\TaxonomySlugFilter;
use PsychedCms\Workflow\Content\PublicationWorkflowAwareInterface;
use PsychedCms\Workflow\Content\PublicationWorkflowTrait;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PostRepository::class)]
#[ORM\Table(name: 'posts')]
#[ORM\Index(columns: ['status'], name: 'idx_posts_status')]
#[ORM\Index(columns: ['author_id'], name: 'idx_posts_author_id')]
#[ApiResource(mercure: true)]
#[ApiFilter(SearchFilter::class, properties: ['title' => 'partial'])]
#[ApiFilter(TaxonomySlugFilter::class, properties: ['tags'])]
#[ContentType(icon: 'Article', locales: ['en', 'fr'])]
#[Gedmo\TranslationEntity(class: PostTranslation::class)]
class Post implements PublicationWorkflowAwareInterface, TranslatableInterface
{
    use ContentTrait;
    use PublicationWorkflowTrait;
    use TranslatableTrait;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Gedmo\Translatable]
    #[TextField(label: 'Title', required: true, group: 'content', translatable: true)]
    private ?string $title = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Gedmo\Translatable]
    #[TextareaField(label: 'Excerpt', group: 'content', translatable: true)]
    private ?string $excerpt = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Gedmo\Translatable]
    #[HtmlField(label: 'Content', group: 'content', translatable: true)]
    private ?string $content = null;

    #[ORM\ManyToOne(targetEntity: Media::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[ImageField(label: 'Featured Image', group: 'media')]
    private ?Media $featuredImage = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[RelationField(reference: 'users', displayField: 'email', label: 'Author', group: 'sidebar')]
    private ?User $author = null;

    #[ORM\ManyToMany(targetEntity: Taxonomy::class)]
    #[ORM\JoinTable(name: 'post_tags')]
    #[TaxonomyField(taxonomy: 'tags', multiple: true, allowCreate: true, label: 'Tags', group: 'metadata')]
    private Collection $tags;

    #[ORM\ManyToMany(targetEntity: Genre::class)]
    #[ORM\JoinTable(name: 'post_genres')]
    #[EntityTaxonomyField(multiple: true, label: 'Genres', group: 'metadata')]
    private Collection $genres;

    #[ORM\ManyToMany(targetEntity: Post::class)]
    #[ORM\JoinTable(name: 'post_related_posts')]
    #[RelationField(reference: 'posts', multiple: true, displayField: 'title', label: 'Related Posts', group: 'metadata', max: 5)]
    private Collection $relatedPosts;

    #[ORM\Column(type: 'json', nullable: true)]
    #[CollectionField(
        label: 'Social Links',
        group: 'content',
        schema: [
            'platform' => ['type' => 'select', 'values' => ['spotify', 'apple_music', 'bandcamp', 'youtube', 'instagram', 'facebook', 'twitter']],
            'url' => 'text',
        ],
        max: 10,
    )]
    private ?array $socialLinks = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[UrlField(label: 'External URL', group: 'content', placeholder: 'https://example.com')]
    private ?string $externalUrl = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[DateField(mode: 'datetime', label: 'Event Date & Time', group: 'metadata')]
    private ?\DateTimeImmutable $eventDate = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[GeolocationField(label: 'Location', group: 'metadata')]
    private ?array $location = null;

    /** @var Collection<int, PostTranslation> */
    #[ORM\OneToMany(targetEntity: PostTranslation::class, mappedBy: 'object', cascade: ['persist', 'remove'])]
    #[ApiProperty(readable: false, writable: false)]
    private Collection $translations;

    public function __construct()
    {
        $this->tags = new ArrayCollection();
        $this->genres = new ArrayCollection();
        $this->relatedPosts = new ArrayCollection();
        $this->translations = new ArrayCollection();
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getExcerpt(): ?string
    {
        return $this->excerpt;
    }

    public function setExcerpt(?string $excerpt): static
    {
        $this->excerpt = $excerpt;

        return $this;
    }

    public function getFeaturedImage(): ?Media
    {
        return $this->featuredImage;
    }

    public function setFeaturedImage(?Media $featuredImage): static
    {
        $this->featuredImage = $featuredImage;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @return Collection<int, Taxonomy>
     */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(Taxonomy $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
        }

        return $this;
    }

    public function removeTag(Taxonomy $tag): static
    {
        $this->tags->removeElement($tag);

        return $this;
    }

    /**
     * @return Collection<int, Genre>
     */
    public function getGenres(): Collection
    {
        return $this->genres;
    }

    public function addGenre(Genre $genre): static
    {
        if (!$this->genres->contains($genre)) {
            $this->genres->add($genre);
        }

        return $this;
    }

    public function removeGenre(Genre $genre): static
    {
        $this->genres->removeElement($genre);

        return $this;
    }

    /**
     * @return Collection<int, Post>
     */
    public function getRelatedPosts(): Collection
    {
        return $this->relatedPosts;
    }

    public function addRelatedPost(Post $post): static
    {
        if (!$this->relatedPosts->contains($post)) {
            $this->relatedPosts->add($post);
        }

        return $this;
    }

    public function removeRelatedPost(Post $post): static
    {
        $this->relatedPosts->removeElement($post);

        return $this;
    }

    public function getSocialLinks(): ?array
    {
        return $this->socialLinks;
    }

    public function setSocialLinks(?array $socialLinks): static
    {
        $this->socialLinks = $socialLinks;

        return $this;
    }

    public function getExternalUrl(): ?string
    {
        return $this->externalUrl;
    }

    public function setExternalUrl(?string $externalUrl): static
    {
        $this->externalUrl = $externalUrl;

        return $this;
    }

    public function getEventDate(): ?\DateTimeImmutable
    {
        return $this->eventDate;
    }

    public function setEventDate(?\DateTimeImmutable $eventDate): static
    {
        $this->eventDate = $eventDate;

        return $this;
    }

    public function getLocation(): ?array
    {
        return $this->location;
    }

    public function setLocation(?array $location): static
    {
        $this->location = $location;

        return $this;
    }

    /**
     * @return Collection<int, PostTranslation>
     */
    public function getTranslations(): Collection
    {
        return $this->translations;
    }
}
