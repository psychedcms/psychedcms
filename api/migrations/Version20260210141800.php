<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260210141800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE taxonomies ADD parent_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE taxonomies ADD CONSTRAINT FK_232B80F9727ACA70 FOREIGN KEY (parent_id) REFERENCES taxonomies (id) ON DELETE SET NULL NOT DEFERRABLE');
        $this->addSql('CREATE INDEX idx_taxonomies_parent ON taxonomies (parent_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE taxonomies DROP CONSTRAINT FK_232B80F9727ACA70');
        $this->addSql('DROP INDEX idx_taxonomies_parent');
        $this->addSql('ALTER TABLE taxonomies DROP parent_id');
    }
}
